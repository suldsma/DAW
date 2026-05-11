// BACKEND/SRC/MODULES/GESTION/SERVICES/PROYECTOS.SERVICE.TS
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Like, FindOptionsWhere } from "typeorm";

// Entidades y Enums
import { Proyecto } from "../entities/proyecto.entity";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

// DTOs (Input/Output)
import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";
import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";
import { ListTareaDTO } from "../dtos/output/list-tarea.dto";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";

// Servicios Relacionados
import { ClientesService } from "./clientes.service";

@Injectable()
export class ProyectosService {

    constructor(
        @InjectRepository(Proyecto)
        private readonly repository: Repository<Proyecto>,
        @Inject(forwardRef(() => ClientesService))
        private readonly clientesService: ClientesService
    ) { }

    // --- MÉTODOS DE LECTURA ---

    /**
     * Obtener listado con filtros (Búsqueda Avanzada)
     */
    async obtenerProyectos(nombre?: string, estado?: EstadosProyectosEnum): Promise<ListProyectoDTO[]> {
        const where: FindOptionsWhere<Proyecto> = {};

        if (nombre) where.nombre = Like(`%${nombre}%`);
        if (estado) where.estado = estado;

        const proyectos = await this.repository.find({
            where,
            relations: ['cliente'],
            order: { id: 'ASC' }
        });

        return proyectos.map(p => this.mapToListDto(p));
    }

    /**
     * Obtener detalle completo de un proyecto y sus tareas
     */
    async obtenerProyecto(id: number): Promise<ProyectoDTO> {
        const proyecto = await this.repository.findOne({
            where: { id },
            relations: ['cliente', 'tareas'],
            order: { tareas: { id: 'ASC' } }
        });

        if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

        const dto = new ProyectoDTO();
        dto.nombre = proyecto.nombre;
        dto.estado = proyecto.estado;
        dto.cliente = proyecto.cliente?.nombre || 'Interno';

        dto.tareas = proyecto.tareas.map(t => {
            const tareaDto = new ListTareaDTO();
            tareaDto.id = t.id;
            tareaDto.descripcion = t.descripcion;
            tareaDto.estado = t.estado;
            return tareaDto;
        });

        return dto;
    }

    // --- MÉTODOS DE ESCRITURA ---

    async crearProyecto(dto: CreateProyectoDto): Promise<{ id: number }> {
        const proyecto: Proyecto = this.repository.create(dto);
        proyecto.estado = EstadosProyectosEnum.ACTIVO;

        // Validación de cliente activo (Requerimiento obligatorio)
        if (dto.idCliente) {
            const clienteActivo = await this.clientesService.existeClienteActivoPorId(dto.idCliente);
            if (!clienteActivo) {
                throw new BadRequestException('Solo se puede elegir un cliente en estado ACTIVO');
            }
        }

        await this.repository.save(proyecto);
        return { id: proyecto.id };
    }

    async actualizarProyecto(id: number, dto: UpdateProyectoDto): Promise<void> {
        const proyecto = await this.repository.findOneBy({ id });
        if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

        // Validar cliente si se intenta cambiar
        if (dto.idCliente && dto.idCliente !== proyecto.idCliente) {
            const clienteActivo = await this.clientesService.existeClienteActivoPorId(dto.idCliente);
            if (!clienteActivo) throw new BadRequestException('El nuevo cliente debe estar ACTIVO');
        }

        Object.assign(proyecto, dto);
        await this.repository.save(proyecto);
    }

    async eliminarProyecto(id: number): Promise<void> {
        const proyecto = await this.repository.findOneBy({ id });
        if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

        // Aplicamos borrado lógico pasando a estado BAJA
        proyecto.estado = EstadosProyectosEnum.BAJA;
        await this.repository.save(proyecto);
    }

    // --- MÉTODOS DE UTILIDAD Y ESTADÍSTICAS ---

    async contarProyectosPorEstado(estado: EstadosProyectosEnum): Promise<number> {
        return await this.repository.count({ where: { estado } });
    }

    async existeProyectoPorIdCliente(idCliente: number): Promise<boolean> {
        // Bloquea la baja del cliente si tiene proyectos que no sean BAJA
        return await this.repository.exists({
            where: {
                cliente: { id: idCliente },
                estado: In([EstadosProyectosEnum.ACTIVO, EstadosProyectosEnum.FINALIZADO])
            }
        });
    }

    /**
     * Mapper privado para limpiar el código de obtenerProyectos
     */
    private mapToListDto(p: Proyecto): ListProyectoDTO {
        const dto = new ListProyectoDTO();
        dto.id = p.id;
        dto.nombre = p.nombre;
        dto.estado = p.estado;
        if (p.cliente) {
            dto.cliente = new ListClienteDTO();
            dto.cliente.id = p.cliente.id;
            dto.cliente.nombre = p.cliente.nombre;
            dto.cliente.estado = p.cliente.estado;
        }
        return dto;
    }
}