import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
    ConflictException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsWhere, Not } from "typeorm";

import { Tarea } from "../entities/tarea.entity";
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import { CreateTareaDto } from "../dtos/input/create-tarea.dto";
import { UpdateTareaDto } from "../dtos/input/update-tarea.dto";
import { ListTareaDTO } from "../dtos/output/list-tarea.dto";
import { ProyectosService } from "./proyectos.service";

import { AuditoriaService } from "../../auditoria/services/auditoria.service";
import { TipoEntidadEnum, TipoOperacionEnum } from "../../auditoria/entities/auditoria.entity";

@Injectable()
export class TareasService {

    constructor(
        @InjectRepository(Tarea)
        private readonly repository: Repository<Tarea>,

        @Inject(forwardRef(() => ProyectosService))
        private readonly proyectosService: ProyectosService,

        private readonly auditoriaService: AuditoriaService
    ) { }

    private normalizarDescripcion(descripcion: string): string {
        return descripcion.trim().replace(/\s+/g, ' ');
    }

    private async validarProyectoOperativo(idProyecto: number): Promise<void> {
        const proyecto = await this.proyectosService.obtenerProyecto(idProyecto);
        
        if (!proyecto) {
            throw new BadRequestException(`El proyecto con ID ${idProyecto} no existe`);
        }

        if (proyecto.estado === EstadosProyectosEnum.BAJA) {
            throw new BadRequestException('No se pueden gestionar tareas en un proyecto dado de baja');
        }
    }

    private validarCambioEstado(estadoActual: EstadosTareasEnum, nuevoEstado: EstadosTareasEnum): void {
        if (estadoActual === EstadosTareasEnum.BAJA && nuevoEstado !== EstadosTareasEnum.BAJA) {
            throw new BadRequestException('No se puede reactivar una tarea dada de baja');
        }
        if (estadoActual === nuevoEstado) {
            throw new ConflictException('La tarea ya posee ese estado');
        }
    }

    async obtenerTareas(idProyecto: number, descripcion?: string, estado?: EstadosTareasEnum): Promise<ListTareaDTO[]> {
        const where: FindOptionsWhere<Tarea> = { idProyecto };

        if (descripcion?.trim()) {
            where.descripcion = ILike(`%${descripcion.trim()}%`);
        }

        where.estado = estado ? estado : Not(EstadosTareasEnum.BAJA);

        const tareas = await this.repository.find({
            where,
            order: { id: 'ASC' }
        });

        return tareas.map(tarea => this.mapToListDto(tarea));
    }

    async obtenerTareaPorId(id: number): Promise<ListTareaDTO> {
        const tarea = await this.repository.findOneBy({ id });
        if (!tarea) throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
        return this.mapToListDto(tarea);
    }

    async crearTarea(dto: CreateTareaDto, idProyecto: number, usuarioActual: any): Promise<{ id: number }> {
        await this.validarProyectoOperativo(idProyecto);

        const descripcionNormalizada = this.normalizarDescripcion(dto.descripcion);

        const tarea = this.repository.create({
            ...dto,
            descripcion: descripcionNormalizada,
            estado: EstadosTareasEnum.PENDIENTE,
            idProyecto 
        });

        const guardada = await this.repository.save(tarea);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.TAREA,
            guardada.id,
            TipoOperacionEnum.CREAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );

        return { id: guardada.id };
    }

    async actualizarTarea(id: number, dto: UpdateTareaDto, usuarioActual: any): Promise<void> {
        const tareaEntity = await this.repository.findOneBy({ id });
        if (!tareaEntity) throw new NotFoundException(`Tarea con ID ${id} no encontrada`);

        if (dto.descripcion) {
            tareaEntity.descripcion = this.normalizarDescripcion(dto.descripcion);
        }

        if (dto.estado) {
            this.validarCambioEstado(tareaEntity.estado, dto.estado);
            tareaEntity.estado = dto.estado;
        }

        await this.repository.save(tareaEntity);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.TAREA,
            tareaEntity.id,
            TipoOperacionEnum.ACTUALIZAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

    async eliminarTarea(id: number, usuarioActual: any): Promise<void> {
        const tarea = await this.repository.findOneBy({ id });
        if (!tarea) throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
        
        if (tarea.estado === EstadosTareasEnum.BAJA) {
            throw new BadRequestException('La tarea ya fue dada de baja');
        }

        tarea.estado = EstadosTareasEnum.BAJA;
        await this.repository.save(tarea);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.TAREA,
            tarea.id,
            TipoOperacionEnum.ELIMINAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

    async obtenerTareasKanban(idProyecto: number): Promise<Record<string, ListTareaDTO[]>> {
        const tareas = await this.obtenerTareas(idProyecto);

        const tablero: Record<string, ListTareaDTO[]> = {
            [EstadosTareasEnum.PENDIENTE]: [],
            [EstadosTareasEnum.FINALIZADA]: []
        };

        tareas.forEach(t => {
            const estado = t.estado.toString();
            if (tablero[estado]) {
                tablero[estado].push(t);
            }
        });

        return tablero;
    }

    async contarTareasPorEstado(estado: EstadosTareasEnum): Promise<number> {
        return await this.repository.count({
            where: { estado }
        });
    }

    async contarTareasPendientes(idProyecto: number): Promise<number> {
        return await this.repository.count({
            where: { idProyecto, estado: EstadosTareasEnum.PENDIENTE }
        });
    }

    private mapToListDto(tarea: Tarea): ListTareaDTO {
        const dto = new ListTareaDTO();
        dto.id = tarea.id;
        dto.descripcion = tarea.descripcion;
        dto.estado = tarea.estado;
        return dto;
    }
}