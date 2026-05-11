// backend/src/modules/gestion/controllers/proyectos.controller.ts
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
    Delete 
} from "@nestjs/common";
import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";
import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiQuery } from "@nestjs/swagger";
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";
import { ProyectosService } from "../services/proyectos.service";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

@ApiTags('Proyectos')
@ApiBearerAuth()
@UseGuards(AuthGuard) 
@Controller('proyectos')
export class ProyectosController {

    constructor(private readonly proyectosService: ProyectosService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo proyecto' })
    async crearProyecto(@Body() dto: CreateProyectoDto): Promise<{ id: number }> {
        return await this.proyectosService.crearProyecto(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un proyecto existente' })
    async actualizarProyecto(
        @Param('id', ParseIntPipe) id: number, 
        @Body() dto: UpdateProyectoDto
    ): Promise<void> {
        await this.proyectosService.actualizarProyecto(id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listado de proyectos con filtros de búsqueda avanzada' })
    @ApiOkResponse({ type: ListProyectoDTO, isArray: true })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @ApiQuery({ name: 'nombre', required: false, type: String, description: 'Filtro por nombre de proyecto' })
    async obtenerProyectos(
        @Query("nombre") nombre?: string,
        @Query("estado") estado?: EstadosProyectosEnum
    ): Promise<ListProyectoDTO[]> {
        return await this.proyectosService.obtenerProyectos(nombre, estado);
    }

    @Get('exportar/csv')
    @ApiOperation({ summary: 'Funcionalidad Extra: Exportar lista de proyectos a CSV' })
    async exportarCSV() {
        const proyectos = await this.proyectosService.obtenerProyectos();
        const encabezado = "ID;Nombre;Estado;Cliente\n";
        const filas = proyectos.map(p => 
            `${p.id};${p.nombre};${p.estado};${p.cliente?.nombre || 'Interno'}`
        ).join("\n");
        
        return { 
            data: encabezado + filas,
            filename: `reporte_proyectos_${new Date().getTime()}.csv`
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalle de proyecto incluyendo sus tareas' })
    @ApiOkResponse({ type: ProyectoDTO })
    async obtenerProyecto(@Param('id', ParseIntPipe) id: number): Promise<ProyectoDTO> {
        return await this.proyectosService.obtenerProyecto(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un proyecto' })
    async eliminarProyecto(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.proyectosService.eliminarProyecto(id);
    }
}