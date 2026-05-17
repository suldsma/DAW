// BACKEND/SRC/MODULES/ESTADISTICAS/CONTROLLERS/ESTADISTICAS.CONTROLLER.TS

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { EstadisticasService } from '../services/estadisticas.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';

@ApiTags('Reportes y Estadísticas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('estadisticas')
export class EstadisticasController {

    constructor(private readonly estadisticasService: EstadisticasService) { }

    @Get('resumen')
    @ApiOperation({ summary: 'Obtener métricas generales del sistema' })
    @ApiResponse({ status: 200, description: 'Resumen de proyectos activos, finalizados y tareas.' })
    async obtenerResumen() {
        return await this.estadisticasService.obtenerResumenGeneral();
    }

    @Get('por-cliente')
    @ApiOperation({ 
        summary: 'Estadísticas por cliente',
        description: 'Incluye cantidad total de proyectos por cada cliente registrado.'
    })
    async obtenerEstadisticasPorCliente() {
        return await this.estadisticasService.obtenerEstadisticasPorCliente();
    }

    @Get('por-proyecto')
    @ApiOperation({ 
        summary: 'Estadísticas detalladas por proyecto',
        description: 'Muestra el porcentaje de avance basándose en tareas finalizadas vs pendientes.'
    })
    async obtenerEstadisticasPorProyecto() {
        return await this.estadisticasService.obtenerEstadisticasPorProyecto();
    }

    @Get('proximos-a-completarse')
    @ApiOperation({ 
        summary: 'Proyectos próximos a completarse',
        description: 'Proyectos con alta tasa de tareas en estado FINALIZADA.'
    })
    async obtenerProyectosProximos() {
        return await this.estadisticasService.obtenerProyectosProximosACompletarse();
    }

    @Get('atrasados')
    @ApiOperation({ 
        summary: 'Proyectos con bajo progreso',
        description: 'Proyectos activos que requieren atención por tener pocas tareas completadas.'
    })
    async obtenerProyectosAtrasados() {
        return await this.estadisticasService.obtenerProyectosAtrasados();
    }
}