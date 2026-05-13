// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/TAREAS.CONTROLLER.TS
// ✅ VERSIÓN FINAL CORREGIDA Y COMPATIBLE CON TU SERVICE ACTUAL

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
    Query,
    UseGuards
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';

// Services
import { TareasService } from '../services/tarea.service';

// Auth
import { AuthGuard } from '../../auth/guards/auth.guard';

// DTOs INPUT
import { CreateTareaDto } from '../dtos/input/create-tarea.dto';
import { UpdateTareaDto } from '../dtos/input/update-tarea.dto';

// DTOs OUTPUT
import { ListTareaDTO } from '../dtos/output/list-tarea.dto';

// Enums
import { EstadosTareasEnum } from '../enums/estados-tareas.enum';

@ApiTags('Tareas')

@ApiBearerAuth()

/**
 * 🔐 Protección JWT
 */
@UseGuards(AuthGuard)

@Controller('gestion/proyectos/:idProyecto/tareas')
export class TareasController {

    constructor(
        private readonly tareasService: TareasService
    ) { }

    /**
     * =====================================================
     * CREAR TAREA
     * =====================================================
     */
    @Post()

    @HttpCode(HttpStatus.CREATED)

    @ApiOperation({
        summary:
            'Agregar una tarea a un proyecto'
    })

    @ApiCreatedResponse({
        description:
            'Tarea creada exitosamente',
        schema: {
            example: {
                id: 1
            }
        }
    })

    @ApiUnauthorizedResponse({
        description:
            'No autorizado'
    })

    async crearTarea(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Body()
        dto: CreateTareaDto

    ): Promise<{ id: number }> {

        return await this.tareasService
            .crearTarea(dto, idProyecto);
    }

    /**
     * =====================================================
     * TABLERO KANBAN
     * =====================================================
     * IMPORTANTE:
     * Debe ir antes de GET(':id')
     */
    @Get('kanban/tablero')

    @ApiOperation({
        summary:
            'Obtener tareas agrupadas por estado'
    })

    @ApiOkResponse({
        description:
            'Kanban generado correctamente'
    })

    async obtenerTareasKanban(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number

    ): Promise<Record<string, any>> {

        return await this.tareasService
            .obtenerTareasKanban(idProyecto);
    }

    /**
     * =====================================================
     * LISTAR TAREAS
     * =====================================================
     */
    @Get()

    @ApiOperation({
        summary:
            'Listar tareas con filtros'
    })

    @ApiOkResponse({
        type: ListTareaDTO,
        isArray: true
    })

    @ApiQuery({
        name: 'descripcion',
        required: false,
        type: String
    })

    @ApiQuery({
        name: 'estado',
        required: false,
        enum: EstadosTareasEnum
    })

    async obtenerTareas(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Query('descripcion')
        descripcion?: string,

        @Query('estado')
        estado?: EstadosTareasEnum

    ): Promise<ListTareaDTO[]> {

        return await this.tareasService
            .obtenerTareas(
                idProyecto,
                descripcion,
                estado
            );
    }

    /**
     * =====================================================
     * OBTENER TAREA POR ID
     * =====================================================
     */
    @Get(':id')

    @ApiOperation({
        summary:
            'Obtener detalle de una tarea'
    })

    @ApiOkResponse({
        type: ListTareaDTO
    })

    @ApiNotFoundResponse({
        description:
            'Tarea no encontrada'
    })

    async obtenerTarea(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Param('id', ParseIntPipe)
        id: number

    ): Promise<ListTareaDTO> {

        /**
         * ⚠️ IMPORTANTE:
         * Tu service actual recibe SOLO el ID.
         * Más adelante podés mejorar el service
         * para validar idProyecto también.
         */
        return await this.tareasService
            .obtenerTareaPorId(id);
    }

    /**
     * =====================================================
     * ACTUALIZAR TAREA
     * =====================================================
     */
    @Put(':id')

    @HttpCode(HttpStatus.NO_CONTENT)

    @ApiOperation({
        summary:
            'Actualizar una tarea'
    })

    @ApiNoContentResponse({
        description:
            'Tarea actualizada correctamente'
    })

    async actualizarTarea(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateTareaDto

    ): Promise<void> {

        /**
         * ⚠️ Tu service actual todavía
         * no recibe idProyecto.
         */
        await this.tareasService
            .actualizarTarea(
                id,
                dto
            );
    }

    /**
     * =====================================================
     * ELIMINAR TAREA
     * =====================================================
     */
    @Delete(':id')

    @HttpCode(HttpStatus.NO_CONTENT)

    @ApiOperation({
        summary:
            'Eliminar una tarea'
    })

    @ApiNoContentResponse({
        description:
            'Tarea eliminada correctamente'
    })

    async eliminarTarea(

        @Param('idProyecto', ParseIntPipe)
        idProyecto: number,

        @Param('id', ParseIntPipe)
        id: number

    ): Promise<void> {

        /**
         * ⚠️ Tu service actual todavía
         * no recibe idProyecto.
         */
        await this.tareasService
            .eliminarTarea(id);
    }
}