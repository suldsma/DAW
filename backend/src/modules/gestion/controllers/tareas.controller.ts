// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/TAREAS.CONTROLLER.TS
import { Body, Controller, Param, Post, Put, Delete, Get, Query, UseGuards, ParseIntPipe } from "@nestjs/common";
import { UpdateTareaDto } from "../dtos/input/update-tarea.dto";
import { CreateTareaDto } from "../dtos/input/create-tarea.dto";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from "@nestjs/swagger";
import { TareasService } from "../services/tarea.service";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";

@ApiTags('Tareas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('proyectos/:idProyecto/tareas')
export class TareasController {

    constructor(private readonly tareasService: TareasService) { }

    @Post()
    @ApiOperation({ summary: 'Agregar una tarea a un proyecto' })
    async crearTarea(
        @Param('idProyecto', ParseIntPipe) idProyecto: number,
        @Body() dto: CreateTareaDto
    ): Promise<{ id: number }> {
        return await this.tareasService.crearTarea(dto, idProyecto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Modificar una tarea' })
    async actualizarTarea(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTareaDto
    ): Promise<void> {
        await this.tareasService.actualizarTarea(id, dto);
    }

    // Requerimiento obligatorio: Poder eliminar tareas
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una tarea' })
    async eliminarTarea(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.tareasService.eliminarTarea(id);
    }

    // Funcionalidad Extra 1: Búsqueda Avanzada en Tareas
    @Get()
    @ApiOperation({ summary: 'Listar tareas de un proyecto con filtros' })
    @ApiQuery({ name: 'descripcion', required: false })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosTareasEnum })
    async obtenerTareas(
        @Param('idProyecto', ParseIntPipe) idProyecto: number,
        @Query('descripcion') descripcion?: string,
        @Query('estado') estado?: EstadosTareasEnum
    ) {
        return await this.tareasService.obtenerTareas(idProyecto, descripcion, estado);
    }
}