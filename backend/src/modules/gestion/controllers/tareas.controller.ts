// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/TAREAS.CONTROLLER.TS
import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Delete,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiCreatedResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiQuery, 
  ApiTags 
} from '@nestjs/swagger';

import { TareasService } from '../services/tarea.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CreateTareaDto } from '../dtos/input/create-tarea.dto';
import { UpdateTareaDto } from '../dtos/input/update-tarea.dto';
import { ListTareaDTO } from '../dtos/output/list-tarea.dto';
import { EstadosTareasEnum } from '../enums/estados-tareas.enum';

@ApiTags('Tareas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('gestion/proyectos/:idProyecto/tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  /**
   * POST: Crear una nueva tarea vinculada al proyecto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar una tarea a un proyecto' })
  @ApiCreatedResponse({
    description: 'Tarea creada exitosamente',
    schema: { example: { id: 1 } },
  })
  async crearTarea(
    @Param('idProyecto', ParseIntPipe) idProyecto: number,
    @Body() dto: CreateTareaDto,
  ): Promise<{ id: number }> {
    return await this.tareasService.crearTarea(dto, idProyecto);
  }

  /**
   * GET: Kanban (Debe ir antes de :id para evitar conflictos de rutas)
   * Se asume que implementaste 'obtenerTareasKanban' en el servicio como sugerí arriba.
   */
  @Get('kanban/tablero')
  @ApiOperation({ summary: 'Obtener tareas agrupadas por estado (Kanban)' })
  async obtenerTareasKanban(
    @Param('idProyecto', ParseIntPipe) idProyecto: number,
  ): Promise<Record<string, any>> {
    // IMPORTANTE: Llamamos al método específico de Kanban para evitar error de tipos
    return await this.tareasService.obtenerTareasKanban(idProyecto);
  }

  /**
   * GET: Listado general con filtros
   */
  @Get()
  @ApiOperation({ summary: 'Listar tareas de un proyecto con filtros' })
  @ApiQuery({ name: 'descripcion', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: EstadosTareasEnum })
  async obtenerTareas(
    @Param('idProyecto', ParseIntPipe) idProyecto: number,
    @Query('descripcion') descripcion?: string,
    @Query('estado') estado?: EstadosTareasEnum,
  ): Promise<ListTareaDTO[]> {
    return await this.tareasService.obtenerTareas(idProyecto, descripcion, estado);
  }

  /**
   * GET: Detalle de una tarea específica
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener datos de una tarea específica' })
  @ApiOkResponse({ type: ListTareaDTO })
  async obtenerTarea(
    @Param('idProyecto', ParseIntPipe) idProyecto: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ListTareaDTO> {
    return await this.tareasService.obtenerTareaPorId(id);
  }

  /**
   * PUT: Actualización de datos o cambio de estado
   */
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Modificar una tarea (descripción o estado)' })
  async actualizarTarea(
    @Param('idProyecto', ParseIntPipe) idProyecto: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTareaDto,
  ): Promise<void> {
    await this.tareasService.actualizarTarea(id, dto);
  }

  /**
   * DELETE: Borrado lógico
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una tarea (borrado lógico)' })
  async eliminarTarea(
    @Param('idProyecto', ParseIntPipe) idProyecto: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.tareasService.eliminarTarea(id);
  }
}