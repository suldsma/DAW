import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsWhere, Not } from "typeorm";

import { Proyecto } from "../entities/proyecto.entity";
import { Cliente } from "../entities/cliente.entity";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";
import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";
import { ListTareaDTO } from "../dtos/output/list-tarea.dto";
import { ClientesService } from "./clientes.service";
import { AuditoriaService } from "../../auditoria/services/auditoria.service";
import { TipoEntidadEnum, TipoOperacionEnum } from "../../auditoria/entities/auditoria.entity";

@Injectable()
export class ProyectosService {
    private readonly logger = new Logger(ProyectosService.name);

    constructor(
        @InjectRepository(Proyecto) private readonly repository: Repository<Proyecto>,
        @InjectRepository(Cliente) private readonly clienteRepository: Repository<Cliente>,
        @Inject(forwardRef(() => ClientesService)) private readonly clientesService: ClientesService,
        private readonly auditoriaService: AuditoriaService
    ) { }

    private normalizarNombre(nombre: string): string {
        return nombre.trim().replace(/\s+/g, ' ');
    }

    async obtenerProyectos(nombre?: string, estado?: EstadosProyectosEnum): Promise<ListProyectoDTO[]> {
        const where: FindOptionsWhere<Proyecto> = {};
        if (nombre?.trim()) where.nombre = ILike(`%${nombre.trim()}%`);
        where.estado = estado || Not(EstadosProyectosEnum.BAJA);

        const proyectos = await this.repository.find({
            where,
            relations: { cliente: true },
            order: { nombre: 'ASC' }
        });
        return proyectos.map(p => this.mapToListDto(p));
    }

    async obtenerProyecto(id: number): Promise<ProyectoDTO> {
        const proyecto = await this.repository.findOne({
            where: { id },
            relations: { cliente: true, tareas: true }
        });
        if (!proyecto) throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);

        const dto = new ProyectoDTO();
        dto.id = proyecto.id;
        dto.nombre = proyecto.nombre;
        dto.estado = proyecto.estado;
        dto.cliente = proyecto.cliente?.nombre || 'Interno';
        dto.tareas = (proyecto.tareas || []).filter(t => t.estado !== EstadosTareasEnum.BAJA).map(t => {
            const td = new ListTareaDTO();
            td.id = t.id; td.descripcion = t.descripcion; td.estado = t.estado;
            return td;
        });
        return dto;
    }

    async crearProyecto(dto: CreateProyectoDto, usuarioActual: any): Promise<{ id: number }> {
        const nombreNormalizado = this.normalizarNombre(dto.nombre);
        if (await this.existeProyectoPorNombre(nombreNormalizado)) {
            throw new ConflictException(`Ya existe un proyecto con el nombre "${nombreNormalizado}"`);
        }

        if (dto.idCliente) {
            const cliente = await this.clienteRepository.findOneBy({ id: dto.idCliente });
            if (!cliente || cliente.estado !== EstadosClientesEnum.ACTIVO) {
                throw new BadRequestException("El cliente no existe o no está activo");
            }
        }

        const nuevoProyecto = this.repository.create({ ...dto, nombre: nombreNormalizado, estado: EstadosProyectosEnum.ACTIVO });
        const guardado = await this.repository.save(nuevoProyecto);
        return { id: guardado.id };
    }

    async actualizarProyecto(id: number, dto: UpdateProyectoDto, usuarioActual: any): Promise<void> {
        const proyecto = await this.repository.findOneBy({ id });
        if (!proyecto) throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        
        if (dto.nombre) proyecto.nombre = this.normalizarNombre(dto.nombre);
        if (dto.estado) proyecto.estado = dto.estado;
        
        await this.repository.save(proyecto);
    }

    async eliminarProyecto(id: number, usuarioActual: any): Promise<void> {
        const proyecto = await this.repository.findOneBy({ id });
        if (!proyecto) throw new NotFoundException(`Proyecto no encontrado`);
        proyecto.estado = EstadosProyectosEnum.BAJA;
        await this.repository.save(proyecto);
    }

    async contarProyectosPorEstado(estado: EstadosProyectosEnum): Promise<number> {
        return await this.repository.countBy({ estado });
    }

    async existeProyectoPorNombre(nombre: string, excluyendoId?: number): Promise<boolean> {
        const query = this.repository.createQueryBuilder('proyecto')
            .where('LOWER(proyecto.nombre) = LOWER(:nombre)', { nombre: this.normalizarNombre(nombre) });
        if (excluyendoId) query.andWhere('proyecto.id != :id', { id: excluyendoId });
        return await query.getExists();
    }

    private mapToListDto(proyecto: Proyecto): ListProyectoDTO {
        const dto = new ListProyectoDTO();
        dto.id = proyecto.id;
        dto.nombre = proyecto.nombre;
        dto.estado = proyecto.estado;
        dto.cliente = proyecto.cliente ? { id: proyecto.cliente.id, nombre: proyecto.cliente.nombre, estado: proyecto.cliente.estado } as any : null;
        return dto;
    }
}