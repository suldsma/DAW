// BACKEND/SRC/MODULES/GESTION/SERVICES/COMENTARIOS.SERVICE.TS

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Inject,
    forwardRef
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

// ======================================================
// ENTITIES
// ======================================================

import { ComentarioTarea } from "../entities/comentario-tarea.entity";

// ======================================================
// DTOS
// ======================================================

import { CreateComentarioDto } from "../dtos/input/create-comentario.dto";
import { UpdateComentarioDto } from "../dtos/input/update-comentario.dto";
import { ComentarioDTO } from "../dtos/output/comentario.dto";

// ======================================================
// SERVICES
// ======================================================

import { TareasService } from "./tarea.service";

@Injectable()
export class ComentariosService {

    /**
     * ======================================================
     * CONSTRUCTOR
     * ======================================================
     */
    constructor(

        @InjectRepository(ComentarioTarea)
        private readonly repository: Repository<ComentarioTarea>,

        @Inject(forwardRef(() => TareasService))
        private readonly tareasService: TareasService

    ) { }

    // ======================================================
    // CREAR COMENTARIO
    // ======================================================

    async crearComentario(
        idTarea: number,
        idUsuario: number,
        dto: CreateComentarioDto
    ): Promise<{ id: number }> {

        /**
         * Validar tarea existente
         */
        await this.tareasService.obtenerTareaPorId(
            idTarea
        );

        /**
         * Sanitizar contenido
         */
        const contenido = dto.contenido?.trim();

        /**
         * Validar contenido
         */
        if (!contenido) {
            throw new BadRequestException(
                'El contenido del comentario no puede estar vacío'
            );
        }

        /**
         * Validar longitud máxima
         */
        if (contenido.length > 1000) {
            throw new BadRequestException(
                'El comentario no puede superar los 1000 caracteres'
            );
        }

        /**
         * Crear entidad
         */
        const comentario = this.repository.create({
            contenido,
            idTarea,
            idUsuario
        });

        /**
         * Guardar
         */
        const comentarioGuardado =
            await this.repository.save(comentario);

        return {
            id: comentarioGuardado.id
        };
    }

    // ======================================================
    // OBTENER COMENTARIOS
    // ======================================================

    async obtenerComentariosPorTarea(
        idTarea: number
    ): Promise<ComentarioDTO[]> {

        /**
         * Validar tarea
         */
        await this.tareasService.obtenerTareaPorId(
            idTarea
        );

        /**
         * Buscar comentarios
         */
        const comentarios = await this.repository.find({

            where: {
                idTarea
            },

            relations: [
                'usuario'
            ],

            order: {
                fechaCreacion: 'DESC'
            }
        });

        /**
         * Mapear DTO
         */
        return comentarios.map(comentario => ({

            id: comentario.id,

            contenido: comentario.contenido,

            nombreUsuario:
                comentario.usuario?.nombre ??
                'Usuario eliminado',

            fechaCreacion:
                comentario.fechaCreacion,

            fechaActualizacion:
                comentario.fechaActualizacion
        }));
    }

    // ======================================================
    // ACTUALIZAR COMENTARIO
    // ======================================================

    async actualizarComentario(
        idComentario: number,
        idUsuarioActual: number,
        dto: UpdateComentarioDto
    ): Promise<void> {

        /**
         * Buscar comentario
         */
        const comentario =
            await this.repository.findOneBy({
                id: idComentario
            });

        /**
         * Validar existencia
         */
        if (!comentario) {

            throw new NotFoundException(
                `Comentario con ID ${idComentario} no encontrado`
            );
        }

        /**
         * Validar propietario
         */
        if (
            comentario.idUsuario !== idUsuarioActual
        ) {

            throw new ForbiddenException(
                'Solo el autor puede editar este comentario'
            );
        }

        /**
         * Sanitizar contenido
         */
        const contenido = dto.contenido?.trim();

        /**
         * Validar contenido
         */
        if (!contenido) {

            throw new BadRequestException(
                'El contenido no puede estar vacío'
            );
        }

        /**
         * Validar longitud
         */
        if (contenido.length > 1000) {

            throw new BadRequestException(
                'El comentario no puede superar los 1000 caracteres'
            );
        }

        /**
         * Actualizar
         */
        comentario.contenido = contenido;

        /**
         * Guardar cambios
         */
        await this.repository.save(comentario);
    }

    // ======================================================
    // ELIMINAR COMENTARIO
    // ======================================================

    async eliminarComentario(
        idComentario: number,
        idUsuarioActual: number
    ): Promise<void> {

        /**
         * Buscar comentario
         */
        const comentario =
            await this.repository.findOneBy({
                id: idComentario
            });

        /**
         * Validar existencia
         */
        if (!comentario) {

            throw new NotFoundException(
                `Comentario con ID ${idComentario} no encontrado`
            );
        }

        /**
         * Validar propietario
         */
        if (
            comentario.idUsuario !== idUsuarioActual
        ) {

            throw new ForbiddenException(
                'Solo el autor puede eliminar este comentario'
            );
        }

        /**
         * Eliminar comentario
         */
        await this.repository.delete(idComentario);
    }

    // ======================================================
    // ESTADÍSTICAS
    // ======================================================

    async contarComentariosPorTarea(
        idTarea: number
    ): Promise<number> {

        return this.repository.count({
            where: {
                idTarea
            }
        });
    }

}