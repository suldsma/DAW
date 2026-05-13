// BACKEND/SRC/MODULES/GESTION/SERVICES/TAREA.SERVICE.TS
import { 
    Injectable, 
    NotFoundException,
    BadRequestException,
    Inject, 
    forwardRef 
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, FindOptionsWhere, Not } from "typeorm"; // ✅ Agregado 'Not' aquí

// Entidades y Enums
import { Tarea } from "../entities/tarea.entity";
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";

// DTOs
import { CreateTareaDto } from "../dtos/input/create-tarea.dto";
import { UpdateTareaDto } from "../dtos/input/update-tarea.dto";

// Servicios
import { ProyectosService } from "./proyectos.service";

@Injectable()
export class TareasService {

    constructor(
        @InjectRepository(Tarea) 
        private readonly repository: Repository<Tarea>,
        @Inject(forwardRef(() => ProyectosService))
        private readonly proyectosService: ProyectosService
    ) {}

    // --- MÉTODOS DE LECTURA ---

    /**
     * Obtener tareas de un proyecto con filtros (Búsqueda Avanzada)
     */
    async obtenerTareas(idProyecto: number, descripcion?: string, estado?: EstadosTareasEnum): Promise<Tarea[]> {
        await this.validarProyectoExiste(idProyecto);

        const where: FindOptionsWhere<Tarea> = { idProyecto };

        if (descripcion) where.descripcion = Like(`%${descripcion}%`);
        
        if (estado) {
            where.estado = estado;
        } else {
            // ✅ Mostrar todo lo que no sea BAJA por defecto
            where.estado = Not(EstadosTareasEnum.BAJA) as any;
        }

        return await this.repository.find({
            where,
            order: { id: 'ASC' }
        });
    }

    /**
     * Obtener una tarea específica
     */
    async obtenerTareaPorId(idTarea: number): Promise<Tarea> {
        const tarea = await this.repository.findOneBy({ id: idTarea });

        if (!tarea) {
            throw new NotFoundException(`Tarea con ID ${idTarea} no encontrada`);
        }

        return tarea;
    }

    /**
     * Validar que un proyecto existe
     */
    private async validarProyectoExiste(idProyecto: number): Promise<void> {
        const proyecto = await this.proyectosService['repository'].findOneBy({ id: idProyecto });
        if (!proyecto) {
            throw new BadRequestException(`El proyecto con ID ${idProyecto} no existe`);
        }
    }

    // --- MÉTODOS DE ESCRITURA ---

    async crearTarea(dto: CreateTareaDto, idProyecto: number): Promise<{ id: number }> {
        await this.validarProyectoExiste(idProyecto);

        if (!dto.descripcion || dto.descripcion.trim().length === 0) {
            throw new BadRequestException("La descripción de la tarea no puede estar vacía");
        }

        const tarea = this.repository.create(dto);
        tarea.estado = EstadosTareasEnum.PENDIENTE; 
        tarea.idProyecto = idProyecto;

        await this.repository.save(tarea);
        return { id: tarea.id };
    }

    async actualizarTarea(idTarea: number, dto: UpdateTareaDto): Promise<void> {
        const tarea = await this.repository.findOneBy({ id: idTarea });

        if (!tarea) {
            throw new NotFoundException(`Tarea con ID ${idTarea} no encontrada`);
        }

        if (dto.descripcion && dto.descripcion.trim().length === 0) {
            throw new BadRequestException("La descripción no puede estar vacía");
        }

        Object.assign(tarea, dto);
        await this.repository.save(tarea);
    }

    async eliminarTarea(idTarea: number): Promise<void> {
        const tarea = await this.repository.findOneBy({ id: idTarea });
        
        if (!tarea) {
            throw new NotFoundException(`Tarea con ID ${idTarea} no encontrada`);
        }
        
        tarea.estado = EstadosTareasEnum.BAJA;
        await this.repository.save(tarea);
    }

    // --- MÉTODOS DE KANBAN Y ESTADÍSTICAS ---

    /**
     * Obtener tareas agrupadas por estado para el Tablero
     */
    async obtenerTareasKanban(idProyecto: number): Promise<Record<string, Tarea[]>> {
        await this.validarProyectoExiste(idProyecto);

        const tareas = await this.repository.find({
            where: { 
                idProyecto, 
                estado: Not(EstadosTareasEnum.BAJA) as any 
            },
            order: { id: 'ASC' }
        });

        const tablero: Record<string, Tarea[]> = {
            [EstadosTareasEnum.PENDIENTE]: [],
            // Si tienes un estado 'PROGRESO', deberías agregarlo aquí también
            [EstadosTareasEnum.FINALIZADA]: []
        };

        tareas.forEach(tarea => {
            const estado = tarea.estado.toString();
            if (!tablero[estado]) tablero[estado] = [];
            tablero[estado].push(tarea);
        });

        return tablero;
    }

    async contarTareasPorEstado(estado: EstadosTareasEnum): Promise<number> {
        return await this.repository.count({ where: { estado } });
    }

    async contarTareasPorProyecto(idProyecto: number): Promise<number> {
        return await this.repository.count({ 
            where: { idProyecto, estado: Not(EstadosTareasEnum.BAJA) as any }
        });
    }

    async contarTareasFinalizadasPorProyecto(idProyecto: number): Promise<number> {
        return await this.repository.count({ 
            where: { idProyecto, estado: EstadosTareasEnum.FINALIZADA }
        });
    }
}