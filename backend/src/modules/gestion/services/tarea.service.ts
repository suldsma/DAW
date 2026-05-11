// BACKEND/SRC/MODULES/GESTION/SERVICES/TAREA.SERVICE.TS
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, FindOptionsWhere } from "typeorm";

// Entidades y Enums
import { Tarea } from "../entities/tarea.entity";
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";

// DTOs
import { CreateTareaDto } from "../dtos/input/create-tarea.dto";
import { UpdateTareaDto } from "../dtos/input/update-tarea.dto";

@Injectable()
export class TareasService {

    constructor(
        @InjectRepository(Tarea) 
        private readonly repository: Repository<Tarea>
    ) {}

    // --- MÉTODOS DE LECTURA ---

    /**
     * Obtener tareas de un proyecto con filtros (Búsqueda Avanzada)
     */
    async obtenerTareas(idProyecto: number, descripcion?: string, estado?: EstadosTareasEnum): Promise<Tarea[]> {
        const where: FindOptionsWhere<Tarea> = { idProyecto };

        if (descripcion) where.descripcion = Like(`%${descripcion}%`);
        if (estado) where.estado = estado;

        return await this.repository.find({
            where,
            order: { id: 'ASC' }
        });
    }

    // --- MÉTODOS DE ESCRITURA ---

    /**
     * Crea una tarea vinculada a un proyecto específico
     */
    async crearTarea(dto: CreateTareaDto, idProyecto: number): Promise<{ id: number }> {
        const tarea = this.repository.create(dto);
        
        // Regla de negocio: Estado inicial obligatorio
        tarea.estado = EstadosTareasEnum.PENDIENTE; 
        tarea.idProyecto = idProyecto;

        await this.repository.save(tarea);
        return { id: tarea.id };
    }

    async actualizarTarea(idTarea: number, dto: UpdateTareaDto): Promise<void> {
        const tarea = await this.repository.findOneBy({ id: idTarea });

        if (!tarea) {
            throw new NotFoundException("La tarea indicada no existe");
        }

        this.repository.merge(tarea, dto);
        await this.repository.save(tarea);
    }

    /**
     * Requerimiento obligatorio: Eliminar tareas
     */
    async eliminarTarea(idTarea: number): Promise<void> {
        const tarea = await this.repository.findOneBy({ id: idTarea });
        
        if (!tarea) {
            throw new NotFoundException("No se puede eliminar una tarea que no existe");
        }
        
        await this.repository.remove(tarea);
    }

    // --- MÉTODOS DE ESTADÍSTICAS ---

    async contarTareasPorEstado(estado: EstadosTareasEnum): Promise<number> {
        return await this.repository.count({ where: { estado } });
    }
}