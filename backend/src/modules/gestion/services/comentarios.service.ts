// BACKEND/SRC/MODULES/GESTION/SERVICES/COMENTARIOS.SERVICE.TS
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ComentarioTarea } from "../entities/comentario-tarea.entity";
import { CreateComentarioDto } from "../dtos/input/create-comentario.dto";
import { UpdateComentarioDto } from "../dtos/input/update-comentario.dto";
import { ComentarioDTO } from "../dtos/output/comentario.dto";
import { TareasService } from "./tarea.service";

@Injectable()
export class ComentariosService {

    constructor(
        @InjectRepository(ComentarioTarea)
        private readonly repository: Repository<ComentarioTarea>,
        
        @Inject(forwardRef(() => TareasService)) // ✅ Evita errores de dependencia circular
        private readonly tareasService: TareasService
    ) { }

    /**
     * Crear un comentario en una tarea
     */
    async crearComentario(
        idTarea: number,
        idUsuario: number,
        dto: CreateComentarioDto
    ): Promise<{ id: number }> {
        // Validar que la tarea existe
        await this.tareasService.obtenerTareaPorId(idTarea);

        // Validar contenido
        if (!dto.contenido || dto.contenido.trim().length === 0) {
            throw new BadRequestException("El contenido del comentario no puede estar vacío");
        }

        const comentario = this.repository.create({
            contenido: dto.contenido.trim(),
            idTarea,
            idUsuario,
        });

        await this.repository.save(comentario);
        return { id: comentario.id };
    }

    /**
     * Obtener comentarios de una tarea
     */
    async obtenerComentariosPorTarea(idTarea: number): Promise<ComentarioDTO[]> {
        // Validar que la tarea existe antes de buscar comentarios
        await this.tareasService.obtenerTareaPorId(idTarea);

        const comentarios = await this.repository.find({
            where: { idTarea },
            relations: ['usuario'], // ✅ Asegúrate de tener esta relación en la entidad
            order: { fechaCreacion: 'DESC' }
        });

        return comentarios.map(c => ({
            id: c.id,
            contenido: c.contenido,
            nombreUsuario: c.usuario?.nombre || 'Usuario desconocido',
            fechaCreacion: c.fechaCreacion,
            fechaActualizacion: c.fechaActualizacion,
        }));
    }

    /**
     * Actualizar un comentario (solo el autor puede hacerlo)
     */
    async actualizarComentario(
        idComentario: number,
        idUsuarioActual: number,
        dto: UpdateComentarioDto
    ): Promise<void> {
        const comentario = await this.repository.findOneBy({ id: idComentario });

        if (!comentario) {
            throw new NotFoundException(`Comentario con ID ${idComentario} no encontrado`);
        }

        // Validar propiedad del comentario
        if (comentario.idUsuario !== idUsuarioActual) {
            throw new BadRequestException("Solo el autor puede editar el comentario");
        }

        if (dto.contenido) {
            if (dto.contenido.trim().length === 0) {
                throw new BadRequestException("El contenido no puede estar vacío");
            }
            comentario.contenido = dto.contenido.trim();
        }

        await this.repository.save(comentario);
    }

    /**
     * Eliminar un comentario (solo el autor puede hacerlo)
     */
    async eliminarComentario(
        idComentario: number,
        idUsuarioActual: number
    ): Promise<void> {
        const comentario = await this.repository.findOneBy({ id: idComentario });

        if (!comentario) {
            throw new NotFoundException(`Comentario con ID ${idComentario} no encontrado`);
        }

        if (comentario.idUsuario !== idUsuarioActual) {
            throw new BadRequestException("Solo el autor puede eliminar el comentario");
        }

        await this.repository.delete(idComentario);
    }

    /**
     * Contar comentarios de una tarea
     */
    async contarComentariosPorTarea(idTarea: number): Promise<number> {
        return await this.repository.count({ where: { idTarea } });
    }
}