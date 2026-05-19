import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
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
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";
import { ClientesService } from "./clientes.service";

import { AuditoriaService } from "../../auditoria/services/auditoria.service";
import { TipoEntidadEnum, TipoOperacionEnum } from "../../auditoria/entities/auditoria.entity";

@Injectable()
export class ProyectosService {

    constructor(
        @InjectRepository(Proyecto)
        private readonly repository: Repository<Proyecto>,

        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,

        @Inject(forwardRef(() => ClientesService))
        private readonly clientesService: ClientesService,

        private readonly auditoriaService: AuditoriaService
    ) { }

    private normalizarNombre(nombre: string): string {
        return nombre.trim().replace(/\s+/g, ' ');
    }

    async obtenerProyectos(
        nombre?: string,
        estado?: EstadosProyectosEnum
    ): Promise<ListProyectoDTO[]> {
        const where: FindOptionsWhere<Proyecto> = {};

        if (nombre?.trim()) {
            where.nombre = ILike(`%${nombre.trim()}%`);
        }

        if (estado) {
            where.estado = estado;
        } else {
            where.estado = Not(EstadosProyectosEnum.BAJA);
        }

        const proyectos = await this.repository.find({
            where,
            relations: { cliente: true },
            order: { nombre: 'ASC' }
        });

        return proyectos.map(proyecto => this.mapToListDto(proyecto));
    }

    async obtenerProyecto(id: number): Promise<ProyectoDTO> {
        const proyecto = await this.repository.findOne({
            where: { id },
            relations: { cliente: true, tareas: true }
        });

        if (!proyecto) {
            throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }

        const tareasActivas = proyecto.tareas?.filter(
            tarea => tarea.estado !== EstadosTareasEnum.BAJA
        ) || [];

        const dto = new ProyectoDTO();
        dto.id = proyecto.id;
        dto.nombre = proyecto.nombre;
        dto.estado = proyecto.estado;
        dto.cliente = proyecto.cliente?.nombre || 'Interno';
        dto.tareas = tareasActivas.map(tarea => {
            const tareaDto = new ListTareaDTO();
            tareaDto.id = tarea.id;
            tareaDto.descripcion = tarea.descripcion;
            tareaDto.estado = tarea.estado;
            return tareaDto;
        });

        return dto;
    }

    async existeProyectoPorNombre(
        nombre: string,
        excluyendoId?: number
    ): Promise<boolean> {
        const nombreNormalizado = this.normalizarNombre(nombre);
        const query = this.repository.createQueryBuilder('proyecto')
            .where('LOWER(proyecto.nombre) = LOWER(:nombre)', { nombre: nombreNormalizado });

        if (excluyendoId) {
            query.andWhere('proyecto.id != :id', { id: excluyendoId });
        }

        return await query.getExists();
    }

    async crearProyecto(dto: CreateProyectoDto, usuarioActual: any): Promise<{ id: number }> {
        const nombreNormalizado = this.normalizarNombre(dto.nombre);

        if (await this.existeProyectoPorNombre(nombreNormalizado)) {
            throw new ConflictException(
                `Ya existe un proyecto con el nombre "${nombreNormalizado}"`
            );
        }

        if (dto.idCliente) {
            const cliente = await this.clienteRepository.findOne({
                where: { id: dto.idCliente }
            });

            if (!cliente) {
                throw new NotFoundException(
                    `El cliente con ID ${dto.idCliente} no existe`
                );
            }

            if (cliente.estado !== EstadosClientesEnum.ACTIVO) {
                throw new BadRequestException(
                    `No se puede asignar el cliente "${cliente.nombre}" porque está en estado "${cliente.estado}". ` +
                    `Solo se pueden asignar clientes en estado ACTIVO.`
                );
            }
        }

        const proyecto = this.repository.create({
            ...dto,
            nombre: nombreNormalizado,
            estado: EstadosProyectosEnum.ACTIVO,
            idCliente: dto.idCliente || null
        });

        const proyectoGuardado = await this.repository.save(proyecto);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.PROYECTO,
            proyectoGuardado.id,
            TipoOperacionEnum.CREAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );

        return { id: proyectoGuardado.id };
    }

    async actualizarProyecto(id: number, dto: UpdateProyectoDto, usuarioActual: any): Promise<void> {
        const proyecto = await this.repository.findOne({
            where: { id },
            relations: { cliente: true }
        });

        if (!proyecto) {
            throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }

        if (dto.nombre?.trim()) {
            const nombreNormalizado = this.normalizarNombre(dto.nombre);
            
            if (nombreNormalizado.toLowerCase() !== proyecto.nombre.toLowerCase()) {
                if (await this.existeProyectoPorNombre(nombreNormalizado, id)) {
                    throw new ConflictException(
                        `Ya existe un proyecto con el nombre "${nombreNormalizado}"`
                    );
                }
            }
            proyecto.nombre = nombreNormalizado;
        }

        if (dto.idCliente !== undefined && dto.idCliente !== proyecto.idCliente) {
            if (dto.idCliente !== null) {
                const cliente = await this.clienteRepository.findOne({
                    where: { id: dto.idCliente }
                });

                if (!cliente) {
                    throw new NotFoundException(
                        `El cliente con ID ${dto.idCliente} no existe`
                    );
                }

                if (cliente.estado !== EstadosClientesEnum.ACTIVO) {
                    throw new BadRequestException(
                        `No se puede asignar el cliente "${cliente.nombre}" porque está en estado "${cliente.estado}". ` +
                        `Solo se pueden asignar clientes en estado ACTIVO.`
                    );
                }
            }
            proyecto.idCliente = dto.idCliente;
        }

        if (proyecto.estado === EstadosProyectosEnum.BAJA && 
            dto.estado === EstadosProyectosEnum.ACTIVO) {
            throw new BadRequestException(
                'No se puede reactivar un proyecto que ya fue dado de baja'
            );
        }

        if (dto.estado) {
            proyecto.estado = dto.estado;
        }

        await this.repository.save(proyecto);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.PROYECTO,
            proyecto.id,
            TipoOperacionEnum.ACTUALIZAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

    async cambiarEstadoProyecto(
        id: number,
        nuevoEstado: EstadosProyectosEnum,
        usuarioActual: any
    ): Promise<void> {
        const proyecto = await this.repository.findOne({ where: { id } });

        if (!proyecto) {
            throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }

        if (proyecto.estado === EstadosProyectosEnum.BAJA &&
            nuevoEstado === EstadosProyectosEnum.ACTIVO) {
            throw new BadRequestException(
                'No se puede reactivar un proyecto que ya fue dado de baja'
            );
        }

        proyecto.estado = nuevoEstado;
        await this.repository.save(proyecto);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.PROYECTO,
            proyecto.id,
            TipoOperacionEnum.ACTUALIZAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

    async eliminarProyecto(id: number, usuarioActual: any): Promise<void> {
        const proyecto = await this.repository.findOneBy({ id });

        if (!proyecto) {
            throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }

        if (proyecto.estado === EstadosProyectosEnum.BAJA) {
            throw new BadRequestException('El proyecto ya se encuentra dado de baja');
        }

        proyecto.estado = EstadosProyectosEnum.BAJA;
        await this.repository.save(proyecto);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.PROYECTO,
            proyecto.id,
            TipoOperacionEnum.ELIMINAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

    async existeProyectoPorIdCliente(idCliente: number): Promise<boolean> {
        return await this.repository.exists({
            where: {
                idCliente: idCliente,
                estado: Not(EstadosProyectosEnum.BAJA)
            }
        });
    }

    async contarProyectosPorEstado(estado: EstadosProyectosEnum): Promise<number> {
        return await this.repository.countBy({ estado });
    }

    async obtenerProyectosCliente(idCliente: number): Promise<ListProyectoDTO[]> {
        const proyectos = await this.repository.find({
            where: {
                idCliente,
                estado: Not(EstadosProyectosEnum.BAJA)
            },
            relations: { cliente: true },
            order: { nombre: 'ASC' }
        });

        return proyectos.map(proyecto => this.mapToListDto(proyecto));
    }

    private mapToListDto(proyecto: Proyecto): ListProyectoDTO {
        const dto = new ListProyectoDTO();
        dto.id = proyecto.id;
        dto.nombre = proyecto.nombre;
        dto.estado = proyecto.estado;

        
        if (proyecto.cliente) {
            dto.cliente = {
                id: proyecto.cliente.id,
                nombre: proyecto.cliente.nombre,
                estado: proyecto.cliente.estado
            } as any;
        } else {
            dto.cliente = null;
        }
        return dto;
    }
}