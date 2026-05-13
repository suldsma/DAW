// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/COMENTARIOS.CONTROLLER.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Request,
    UseGuards
} from "@nestjs/common";

import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

// Services
import { ComentariosService } from "../services/comentarios.service";

// DTOs
import { CreateComentarioDto } from "../dtos/input/create-comentario.dto";
import { UpdateComentarioDto } from "../dtos/input/update-comentario.dto";

// Auth
import { AuthGuard } from "../../auth/guards/auth.guard";

@ApiTags('Comentarios')

@ApiBearerAuth()

/**
 * Protección JWT
 */
@UseGuards(AuthGuard)

@Controller(
    'proyectos/:idProyecto/tareas/:idTarea/comentarios'
)
export class ComentariosController {

    constructor(
        private readonly comentariosService: ComentariosService
    ) { }

    /**
     * =====================================================
     * CREAR COMENTARIO
     * =====================================================
     */
    @Post()

    @HttpCode(HttpStatus.CREATED)

    @ApiOperation({
        summary:
            'Agregar un comentario a una tarea'
    })

    @ApiCreatedResponse({
        description:
            'Comentario creado correctamente'
    })

    @ApiUnauthorizedResponse({
        description:
            'No autorizado'
    })

    async crearComentario(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Param('idTarea', ParseIntPipe)
        idTarea: number,

        @Body()
        dto: CreateComentarioDto,

        @Request()
        req: any

    ): Promise<{ id: number }> {

        /**
         * Usuario autenticado
         * CORREGIDO:
         * request.user
         */
        const usuarioId = req.user.sub;

        return await this.comentariosService
            .crearComentario(
                idTarea,
                usuarioId,
                dto
            );
    }

    /**
     * =====================================================
     * LISTAR COMENTARIOS
     * =====================================================
     */
    @Get()

    @ApiOperation({
        summary:
            'Obtener comentarios de una tarea'
    })

    @ApiOkResponse({
        description:
            'Listado de comentarios'
    })

    async obtenerComentarios(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Param('idTarea', ParseIntPipe)
        idTarea: number

    ) {

        return await this.comentariosService
            .obtenerComentariosPorTarea(
                idTarea
            );
    }

    /**
     * =====================================================
     * ACTUALIZAR COMENTARIO
     * =====================================================
     */
    @Put(':idComentario')

    @HttpCode(HttpStatus.NO_CONTENT)

    @ApiOperation({
        summary:
            'Actualizar un comentario'
    })

    @ApiNoContentResponse({
        description:
            'Comentario actualizado correctamente'
    })

    async actualizarComentario(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Param('idTarea', ParseIntPipe)
        idTarea: number,

        @Param('idComentario', ParseIntPipe)
        idComentario: number,

        @Body()
        dto: UpdateComentarioDto,

        @Request()
        req: any

    ): Promise<void> {

        /**
         * Usuario autenticado
         */
        const usuarioId = req.user.sub;

        await this.comentariosService
            .actualizarComentario(
                idComentario,
                usuarioId,
                dto
            );
    }

    /**
     * =====================================================
     * ELIMINAR COMENTARIO
     * =====================================================
     */
    @Delete(':idComentario')

    @HttpCode(HttpStatus.NO_CONTENT)

    @ApiOperation({
        summary:
            'Eliminar un comentario'
    })

    @ApiNoContentResponse({
        description:
            'Comentario eliminado correctamente'
    })

    async eliminarComentario(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Param('idTarea', ParseIntPipe)
        idTarea: number,

        @Param('idComentario', ParseIntPipe)
        idComentario: number,

        @Request()
        req: any

    ): Promise<void> {

        /**
         * Usuario autenticado
         */
        const usuarioId = req.user.sub;

        await this.comentariosService
            .eliminarComentario(
                idComentario,
                usuarioId
            );
    }
}