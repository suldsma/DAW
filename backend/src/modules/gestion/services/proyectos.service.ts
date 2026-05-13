// BACKEND/SRC/MODULES/GESTION/SERVICES/PROYECTOS.SERVICE.TS
// ✅ VERSIÓN LIMPIA Y COMPLETA - COPIA Y PEGA ENTERAMENTE ESTE ARCHIVO

import { 
    BadRequestException, 
    forwardRef, 
    Inject, 
    Injectable, 
    NotFoundException,
    ConflictException
} from "@nestjs/common";
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
     * Por defecto excluye proyectos en BAJA
     */
    async obtenerProyectos(nombre?: string, estado?: EstadosProyectosEnum): Promise<ListProyectoDTO[]> {
        const where: FindOptionsWhere<Proyecto> = {};

        if (nombre) where.nombre = Like(`%${nombre}%`);
        if (estado) {
            where.estado = estado;
        } else {
            // Por defecto mostrar solo ACTIVO y FINALIZADO, no BAJA
            where.estado = In([EstadosProyectosEnum.ACTIVO, EstadosProyectosEnum.FINALIZADO]);
        }

        const proyectos = await this.repository.find({
            where,
            relations: ['cliente'],
            order: { nombre: 'ASC' }
        });

        return proyectos.map(p => this.mapToListDto(p));
    }

    /**
     * Obtener detalle completo de un proyecto y sus tareas
     */
    async obtenerProyecto(id: number): Promise<ProyectoDTO> {
        const proyecto = await this.repository.findOne({
            where: { id },
            relations: ['cliente', 'tareas']
        });

        if (!proyecto) {
            throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }

        // No mostrar tareas en BAJA
        const tareasActivas = proyecto.tareas.filter(
            t => t.estado !== 'BAJA'
        );

        const dto = new ProyectoDTO();
        dto.id = proyecto.id;
        dto.nombre = proyecto.nombre;
        dto.estado = proyecto.estado;
        dto.cliente = proyecto.cliente?.nombre ?? undefined;

        dto.tareas = tareasActivas.map(t => {
            const tareaDto = new ListTareaDTO();
            tareaDto.id = t.id;
            tareaDto.descripcion = t.descripcion;
            tareaDto.estado = t.estado;
            return tareaDto;
        });

        return dto;
    }

    /**
     * Verifica si un nombre de proyecto es único
     */
    async existeProyectoPorNombre(nombre: string, excluyendoId?: number): Promise<boolean> {
        const query = this.repository.createQueryBuilder('proyecto')
            .where('LOWER(proyecto.nombre) = LOWER(:nombre)', { nombre });
        
        if (excluyendoId) {
            query.andWhere('proyecto.id != :id', { id: excluyendoId });
        }

        return (await query.getCount()) > 0;
    }

    // --- MÉTODOS DE ESCRITURA ---

    async crearProyecto(dto: CreateProyectoDto): Promise<{ id: number }> {
        // Verificar que el nombre sea único
        const yaExiste = await this.existeProyectoPorNombre(dto.nombre);
        if (yaExiste) {
            throw new ConflictException(`Ya existe un proyecto con el nombre "${dto.nombre}"`);
        }

        const proyecto: Proyecto = this.repository.create(dto);
        proyecto.estado = EstadosProyectosEnum.ACTIVO;

        // Validar cliente activo
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
        if (!proyecto) throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);

        // Validar nombre si se intenta cambiar
        if (dto.nombre && dto.nombre !== proyecto.nombre) {
            const yaExiste = await this.existeProyectoPorNombre(dto.nombre, id);
            if (yaExiste) {
                throw new ConflictException(`Ya existe un proyecto con el nombre "${dto.nombre}"`);
            }
        }

        // Validar cliente si se intenta cambiar
        if (dto.idCliente && dto.idCliente !== proyecto.idCliente) {
            const clienteActivo = await this.clientesService.existeClienteActivoPorId(dto.idCliente);
            if (!clienteActivo) throw new BadRequestException('El nuevo cliente debe estar ACTIVO');
        }

        Object.assign(proyecto, dto);
        await this.repository.save(proyecto);
    }

    /**
     * Marcar proyecto como BAJA (borrado lógico)
     */
    async eliminarProyecto(id: number): Promise<void> {
        const proyecto = await this.repository.findOneBy({ id });
        if (!proyecto) {
            throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }

        proyecto.estado = EstadosProyectosEnum.BAJA;
        await this.repository.save(proyecto);
    }

    // --- MÉTODOS DE UTILIDAD Y ESTADÍSTICAS ---

    async contarProyectosPorEstado(estado: EstadosProyectosEnum): Promise<number> {
        return await this.repository.count({ where: { estado } });
    }

    /**
     * Verifica si existen proyectos ACTIVOS O FINALIZADOS para un cliente
     */
    async existeProyectoPorIdCliente(idCliente: number): Promise<boolean> {
        return await this.repository.exists({
            where: {
                idCliente,
                estado: In([EstadosProyectosEnum.ACTIVO, EstadosProyectosEnum.FINALIZADO])
            }
        });
    }

    async contarProyectosActivos(): Promise<number> {
        return await this.repository.count({
            where: { estado: EstadosProyectosEnum.ACTIVO }
        });
    }

    async contarProyectosFinalizados(): Promise<number> {
        return await this.repository.count({
            where: { estado: EstadosProyectosEnum.FINALIZADO }
        });
    }

    // --- MÉTODOS PRIVADOS ---

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
        } else {
            dto.cliente = null;
        }
        
        return dto;
    }

}