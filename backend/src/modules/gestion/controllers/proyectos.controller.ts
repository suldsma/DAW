// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/PROYECTOS.CONTROLLER.TS
import { 
    Body, 
    Controller, 
    Get, 
    Param, 
    ParseIntPipe, 
    Post, 
    Put, 
    Query, 
    UseGuards, 
    Delete,
    HttpCode,
    HttpStatus
} from "@nestjs/common";
import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";
import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiQuery, ApiCreatedResponse } from "@nestjs/swagger";
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";
import { ProyectosService } from "../services/proyectos.service";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

@ApiTags('Proyectos')
@ApiBearerAuth()
@UseGuards(AuthGuard) 
@Controller('gestion/proyectos')
export class ProyectosController {

    constructor(private readonly proyectosService: ProyectosService) { }

    /**
     * POST: Crear un nuevo proyecto
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo proyecto' })
    @ApiCreatedResponse({ 
        description: 'Proyecto creado exitosamente',
        schema: { example: { id: 1 } }
    })
    async crearProyecto(@Body() dto: CreateProyectoDto): Promise<{ id: number }> {
        return await this.proyectosService.crearProyecto(dto);
    }

    /**
     * PUT: Actualizar un proyecto existente
     */
    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Actualizar un proyecto existente' })
    async actualizarProyecto(
        @Param('id', ParseIntPipe) id: number, 
        @Body() dto: UpdateProyectoDto
    ): Promise<void> {
        await this.proyectosService.actualizarProyecto(id, dto);
    }

    /**
     * GET: Listar todos los proyectos con filtros de búsqueda avanzada
     * ⚠️ IMPORTANTE: Este endpoint debe estar ANTES que GET ':id'
     * Si no, Angular trata 'exportar' como un ID numérico
     */
    @Get('exportar/csv')
    @ApiOperation({ summary: 'Exportar lista de proyectos a CSV' })
    async exportarCSV() {
        const proyectos = await this.proyectosService.obtenerProyectos();
        
        const encabezado = "ID;Nombre;Estado;Cliente\n";
        const filas = proyectos.map(p => 
            `${p.id};${p.nombre};${p.estado};${p.cliente?.nombre || 'Interno'}`
        ).join("\n");
        
        return { 
            data: encabezado + filas,
            filename: `reporte_proyectos_${new Date().getTime()}.csv`,
            contentType: 'text/csv'
        };
    }

    /**
     * GET: Listar proyectos con filtros
     */
    @Get()
    @ApiOperation({ summary: 'Listar proyectos con filtros de búsqueda avanzada' })
    @ApiOkResponse({ type: ListProyectoDTO, isArray: true })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @ApiQuery({ name: 'nombre', required: false, type: String, description: 'Filtro por nombre de proyecto' })
    async obtenerProyectos(
        @Query("nombre") nombre?: string,
        @Query("estado") estado?: EstadosProyectosEnum
    ): Promise<ListProyectoDTO[]> {
        return await this.proyectosService.obtenerProyectos(nombre, estado);
    }

    /**
     * GET: Obtener detalle de un proyecto (incluye tareas)
     * ⚠️ Este endpoint DEBE estar después de los GET específicos
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de proyecto incluyendo sus tareas' })
    @ApiOkResponse({ type: ProyectoDTO })
    async obtenerProyecto(@Param('id', ParseIntPipe) id: number): Promise<ProyectoDTO> {
        return await this.proyectosService.obtenerProyecto(id);
    }

    /**
     * DELETE: Eliminar (dar de baja) un proyecto
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Dar de baja un proyecto (borrado lógico)' })
    async eliminarProyecto(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.proyectosService.eliminarProyecto(id);
    }
}