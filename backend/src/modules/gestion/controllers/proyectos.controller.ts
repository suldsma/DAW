//backend/src/modules/gestion/controllers/proyectos.controller.ts
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
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";
import { ProyectosService } from "../services/proyectos.service";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

@ApiTags('Proyectos')
@ApiBearerAuth()
@UseGuards(AuthGuard) // Protección JWT requerida
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
    @ApiOperation({ summary: 'Listado de proyectos con info del cliente' })
    @ApiOkResponse({ type: ListProyectoDTO, isArray: true })
    async obtenerProyectos(@Query("estado") estado?: EstadosProyectosEnum): Promise<ListProyectoDTO[]> {
        // ✅ Ajustado: Tu Service actualmente no recibe el parámetro 'estado'
        // Si luego decides filtrar en el Service, puedes volver a pasarle la variable
        return await this.proyectosService.obtenerProyectos();
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
        // ✅ Llama al método que agregamos recién al ProyectosService
        await this.proyectosService.eliminarProyecto(id);
    }
}