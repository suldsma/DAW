// backend/src/modules/gestion/controllers/proyectos.controller.ts

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
    UseGuards,
    Res 
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";

import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";
import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";
import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";
import { ProyectoDTO } from "../dtos/output/proyecto.dto";
import { ProyectosService } from "../services/proyectos.service";
import { JwtAuthGuard } from "../../auth/guards/auth.guard"; 
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import { GetUser } from "../../auth/decorators/get-user.decorator";

@ApiTags('Gestión - Proyectos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('proyectos')
export class ProyectosController {

    constructor(
        private readonly proyectosService: ProyectosService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo proyecto' })
    @ApiCreatedResponse({ description: 'Proyecto creado exitosamente' })
    async crearProyecto(
        @Body() dto: CreateProyectoDto,
        @GetUser() usuario: any 
    ): Promise<{ id: number }> {
    
        return await this.proyectosService.crearProyecto(dto, usuario);
    }

    @Get('exportar/csv')
    @ApiOperation({ summary: 'Descargar lista de proyectos en formato CSV' })
    async exportarCSV(@Res() res: any) {
        const proyectos = await this.proyectosService.obtenerProyectos();

        const encabezado = 'ID;Nombre;Estado;Cliente\n';
        const filas = proyectos.map(p => {

            const nombre = p.nombre.replace(/[;\n\r]/g, '');
            const cliente = (p.cliente?.nombre || 'Interno').replace(/[;\n\r]/g, '');
            return `${p.id};${nombre};${p.estado};${cliente}`;
        }).join('\n');

        const csvContent = encabezado + filas;
        const fileName = `reporte_proyectos_${Date.now()}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        
        return res.status(HttpStatus.OK).send(csvContent);
    }

    @Get()
    @ApiOperation({ summary: 'Listar proyectos con filtros' })
    @ApiOkResponse({ type: ListProyectoDTO, isArray: true })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosProyectosEnum })
    @ApiQuery({ name: 'nombre', required: false, description: 'Filtro parcial' })
    async obtenerProyectos(
        @Query('nombre') nombre?: string,
        @Query('estado') estado?: EstadosProyectosEnum
    ): Promise<ListProyectoDTO[]> {
        return await this.proyectosService.obtenerProyectos(nombre, estado);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle completo de un proyecto' })
    @ApiOkResponse({ type: ProyectoDTO })
    @ApiNotFoundResponse({ description: 'Proyecto no encontrado' })
    async obtenerProyecto(@Param('id', ParseIntPipe) id: number): Promise<ProyectoDTO> {
        return await this.proyectosService.obtenerProyecto(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Actualizar un proyecto existente' })
    async actualizarProyecto(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProyectoDto,
        @GetUser() usuario: any 
    ): Promise<void> {
        await this.proyectosService.actualizarProyecto(id, dto, usuario);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Dar de baja un proyecto (Baja Lógica)' })
    async eliminarProyecto(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() usuario: any 
    ): Promise<void> {
        
        await this.proyectosService.eliminarProyecto(id, usuario);
    }
}