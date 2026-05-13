// BACKEND/SRC/MODULES/ESTADISTICAS/CONTROLLERS/ESTADISTICAS.CONTROLLER.TS
import { Controller, Get, UseGuards } from '@nestjs/common';
import { EstadisticasService } from '../services/estadisticas.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Estadísticas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('estadisticas')
export class EstadisticasController {

    constructor(private readonly estadisticasService: EstadisticasService) { }

    @Get('resumen')
    @ApiOperation({ summary: 'Obtener métricas generales del sistema' })
    async obtenerResumen() {
        return await this.estadisticasService.obtenerResumenGeneral();
    }

    @Get('por-cliente')
    @ApiOperation({ 
        summary: 'Estadísticas por cliente',
        description: 'Incluye cantidad de proyectos, tareas completadas, en progreso, etc.'
    })
    async obtenerEstadisticasPorCliente() {
        return await this.estadisticasService.obtenerEstadisticasPorCliente();
    }

    @Get('por-proyecto')
    @ApiOperation({ 
        summary: 'Estadísticas detalladas por proyecto',
        description: 'Porcentaje de completitud, tareas pendientes, finalizadas, etc.'
    })
    async obtenerEstadisticasPorProyecto() {
        return await this.estadisticasService.obtenerEstadisticasPorProyecto();
    }

    @Get('proximos-a-completarse')
    @ApiOperation({ 
        summary: 'Proyectos próximos a completarse',
        description: 'Proyectos activos con más del 80% de tareas completadas'
    })
    async obtenerProyectosProximos() {
        return await this.estadisticasService.obtenerProyectosProximosACompletarse();
    }

    @Get('atrasados')
    @ApiOperation({ 
        summary: 'Proyectos atrasados',
        description: 'Proyectos activos con menos del 20% de tareas completadas'
    })
    async obtenerProyectosAtrasados() {
        return await this.estadisticasService.obtenerProyectosAtrasados();
    }

}