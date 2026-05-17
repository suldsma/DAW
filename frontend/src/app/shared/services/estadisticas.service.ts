// src/app/shared/services/estadisticas.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ResumenEstadisticas,
  EstadisticasPorCliente,
  EstadisticasPorProyecto
} from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private endpoint = '/estadisticas';

  constructor(private apiService: ApiService) {}

  // Obtener resumen general
  obtenerResumen(): Observable<ResumenEstadisticas> {
    return this.apiService.get<ResumenEstadisticas>(
      `${this.endpoint}/resumen`
    );
  }

  // Obtener estadísticas por cliente
  obtenerEstadisticasPorCliente(): Observable<EstadisticasPorCliente[]> {
    return this.apiService.get<EstadisticasPorCliente[]>(
      `${this.endpoint}/por-cliente`
    );
  }

  // Obtener estadísticas por proyecto
  obtenerEstadisticasPorProyecto(): Observable<EstadisticasPorProyecto[]> {
    return this.apiService.get<EstadisticasPorProyecto[]>(
      `${this.endpoint}/por-proyecto`
    );
  }

  // Obtener proyectos próximos a completarse
  obtenerProyectosProximos(): Observable<EstadisticasPorProyecto[]> {
    return this.apiService.get<EstadisticasPorProyecto[]>(
      `${this.endpoint}/proximos-a-completarse`
    );
  }

  // Obtener proyectos atrasados
  obtenerProyectosAtrasados(): Observable<EstadisticasPorProyecto[]> {
    return this.apiService.get<EstadisticasPorProyecto[]>(
      `${this.endpoint}/atrasados`
    );
  }
}