// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/PROYECTOS.CONTROLLER.TS
// ✅ VERSIÓN MEJORADA Y PROFESIONAL

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
} from "@nestjs/common";

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

// DTOs INPUT
import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";
import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";

// DTOs OUTPUT
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";

// Services
import { ProyectosService } from "../services/proyectos.service";

// Auth
import { AuthGuard } from "../../auth/guards/auth.guard";

// Enums
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

@ApiTags('Proyectos')

@ApiBearerAuth()

/**
 * Protección JWT global
 */
@UseGuards(AuthGuard)

@Controller('gestion/proyectos')
export class ProyectosController {

    constructor(
        private readonly proyectosService: ProyectosService
    ) { }

    /**
     * =====================================================
     * CREAR PROYECTO
     * =====================================================
     */
    @Post()

    @HttpCode(HttpStatus.CREATED)

    @ApiOperation({
        summary: 'Crear un nuevo proyecto'
    })

    @ApiCreatedResponse({
        description: 'Proyecto creado exitosamente',
        schema: {
            example: {
                id: 1
            }
        }
    })

    @ApiBadRequestResponse({
        description: 'Datos inválidos'
    })

    @ApiUnauthorizedResponse({
        description: 'No autorizado'
    })

    async crearProyecto(
        @Body() dto: CreateProyectoDto
    ): Promise<{ id: number }> {

        return await this.proyectosService
            .crearProyecto(dto);
    }

    /**
     * =====================================================
     * EXPORTAR CSV
     * =====================================================
     * IMPORTANTE:
     * Debe ir antes de GET(':id')
     */
    @Get('exportar/csv')

    @ApiOperation({
        summary: 'Exportar lista de proyectos a CSV'
    })

    @ApiOkResponse({
        description: 'CSV generado correctamente'
    })

    async exportarCSV() {

        const proyectos =
            await this.proyectosService.obtenerProyectos();

        const encabezado =
            'ID;Nombre;Estado;Cliente\n';

        const filas = proyectos.map(p => {

            const nombre =
                p.nombre.replace(/[;\n\r]/g, '');

            const cliente =
                (p.cliente?.nombre || 'Interno')
                    .replace(/[;\n\r]/g, '');

            return `${p.id};${nombre};${p.estado};${cliente}`;

        }).join('\n');

        return {

            data: encabezado + filas,

            filename:
                `reporte_proyectos_${Date.now()}.csv`,

            contentType: 'text/csv'
        };
    }

    /**
     * =====================================================
     * LISTAR PROYECTOS
     * =====================================================
     */
    @Get()

    @ApiOperation({
        summary:
            'Listar proyectos con filtros opcionales'
    })

    @ApiOkResponse({
        type: ListProyectoDTO,
        isArray: true
    })

    @ApiQuery({
        name: 'estado',
        required: false,
        enum: EstadosProyectosEnum
    })

    @ApiQuery({
        name: 'nombre',
        required: false,
        type: String,
        description:
            'Filtro parcial por nombre'
    })

    async obtenerProyectos(

        @Query('nombre')
        nombre?: string,

        @Query('estado')
        estado?: EstadosProyectosEnum

    ): Promise<ListProyectoDTO[]> {

        return await this.proyectosService
            .obtenerProyectos(nombre, estado);
    }

    /**
     * =====================================================
     * OBTENER PROYECTO POR ID
     * =====================================================
     */
    @Get(':id')

    @ApiOperation({
        summary:
            'Obtener detalle completo de un proyecto'
    })

    @ApiOkResponse({
        type: ProyectoDTO
    })

    @ApiNotFoundResponse({
        description:
            'Proyecto no encontrado'
    })

    async obtenerProyecto(

        @Param('id', ParseIntPipe)
        id: number

    ): Promise<ProyectoDTO> {

        return await this.proyectosService
            .obtenerProyecto(id);
    }

    /**
     * =====================================================
     * ACTUALIZAR PROYECTO
     * =====================================================
     */
    @Put(':id')

    @HttpCode(HttpStatus.NO_CONTENT)

    @ApiOperation({
        summary:
            'Actualizar un proyecto existente'
    })

    @ApiNoContentResponse({
        description:
            'Proyecto actualizado correctamente'
    })

    @ApiNotFoundResponse({
        description:
            'Proyecto no encontrado'
    })

    async actualizarProyecto(

        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateProyectoDto

    ): Promise<void> {

        await this.proyectosService
            .actualizarProyecto(id, dto);
    }

    /**
     * =====================================================
     * ELIMINAR PROYECTO
     * =====================================================
     */
    @Delete(':id')

    @HttpCode(HttpStatus.NO_CONTENT)

    @ApiOperation({
        summary:
            'Dar de baja un proyecto'
    })

    @ApiNoContentResponse({
        description:
            'Proyecto eliminado correctamente'
    })

    @ApiNotFoundResponse({
        description:
            'Proyecto no encontrado'
    })

    async eliminarProyecto(

        @Param('id', ParseIntPipe)
        id: number

    ): Promise<void> {

        await this.proyectosService
            .eliminarProyecto(id);
    }
}