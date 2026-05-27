// backend/src/modules/gestion/controllers/tareas.controller.ts

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
    ApiTags
} from '@nestjs/swagger';

import { TareasService } from '../services/tareas.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard'; 
import { CreateTareaDto } from '../dtos/input/create-tarea.dto';
import { UpdateTareaDto } from '../dtos/input/update-tarea.dto';
import { ListTareaDTO } from '../dtos/output/list-tarea.dto';
import { EstadosTareasEnum } from '../enums/estados-tareas.enum';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@ApiTags('Gestión - Tareas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('proyectos/:idProyecto/tareas')
export class TareasController {

    constructor(
        private readonly tareasService: TareasService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Agregar una tarea a un proyecto' })
    @ApiCreatedResponse({ description: 'Tarea creada exitosamente' })
    async crearTarea(
        @Param('idProyecto', ParseIntPipe) idProyecto: number,
        @Body() dto: CreateTareaDto,
        @GetUser() usuario: any 
    ): Promise<{ id: number }> {
        return await this.tareasService.crearTarea(dto, idProyecto, usuario);
    }

    @Get('kanban')
    @ApiOperation({ summary: 'Obtener tareas agrupadas por estado (Vista Kanban)' })
    async obtenerTareasKanban(
        @Param('idProyecto', ParseIntPipe) idProyecto: number
    ): Promise<Record<string, ListTareaDTO[]>> {
        return await this.tareasService.obtenerTareasKanban(idProyecto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar tareas del proyecto con filtros' })
    @ApiOkResponse({ type: ListTareaDTO, isArray: true })
    @ApiQuery({ name: 'descripcion', required: false })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosTareasEnum })
    async obtenerTareas(
        @Param('idProyecto', ParseIntPipe) idProyecto: number,
        @Query('descripcion') descripcion?: string,
        @Query('estado') estado?: EstadosTareasEnum
    ): Promise<ListTareaDTO[]> {
        return await this.tareasService.obtenerTareas(idProyecto, descripcion, estado);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de una tarea específica' })
    @ApiOkResponse({ type: ListTareaDTO })
    async obtenerTarea(
        @Param('idProyecto', ParseIntPipe) idProyecto: number, 
        @Param('id', ParseIntPipe) id: number
    ): Promise<ListTareaDTO> {
        return await this.tareasService.obtenerTareaPorId(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Actualizar una tarea' })
    async actualizarTarea(
        @Param('idProyecto', ParseIntPipe) idProyecto: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTareaDto,
        @GetUser() usuario: any 
    ): Promise<void> {
        await this.tareasService.actualizarTarea(id, dto, usuario);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Dar de baja una tarea (Baja Lógica)' })
    async eliminarTarea(
        @Param('idProyecto', ParseIntPipe) idProyecto: number,
        @Param('id', ParseIntPipe) id: number,
        @GetUser() usuario: any 
    ): Promise<void> {

        await this.tareasService.eliminarTarea(id, usuario);
    }
}