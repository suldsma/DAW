// src/modules/estadisticas/controllers/estadisticas.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { EstadisticasService } from '../services/estadisticas.service';
import { AuthGuard } from '../../auth/guards/auth.guard'; // Para cumplir con el requerimiento de Acceso
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Estadísticas')
@ApiBearerAuth()
@UseGuards(AuthGuard) // Solo usuarios válidos pueden ver estadísticas [cite: 27]
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Obtener métricas generales del sistema' })
  obtenerResumen() {
    return this.estadisticasService.obtenerResumenGeneral();
  }
}