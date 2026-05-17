// src/app/modules/estadisticas/pages/estadisticas.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService } from '../../../shared/services/estadisticas.service';
import {
  ResumenEstadisticas,
  EstadisticasPorCliente,
  EstadisticasPorProyecto
} from '../../../shared/models/index';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit, OnDestroy {
  resumen: ResumenEstadisticas | null = null;
  estadisticasPorCliente: EstadisticasPorCliente[] = [];
  estadisticasPorProyecto: EstadisticasPorProyecto[] = [];

  cargando = true;

  private destroy$ = new Subject<void>();

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Lanza en paralelo las tres peticiones HTTP para armar el panel
  cargarEstadisticas(): void {
    this.cargando = true;

    this.estadisticasService.obtenerResumen()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.resumen = data;
        },
        error: (error) => {
          console.error('Error al cargar resumen:', error);
        }
      });

    this.estadisticasService.obtenerEstadisticasPorCliente()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.estadisticasPorCliente = data;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas por cliente:', error);
        }
      });

    this.estadisticasService.obtenerEstadisticasPorProyecto()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.estadisticasPorProyecto = data;
          this.cargando = false; // Finalizo el estado de carga al completarse la última respuesta esperada
        },
        error: (error) => {
          console.error('Error al cargar estadísticas por proyecto:', error);
          this.cargando = false;
        }
      });
  }

  // Define dinámicamente el color de la barra de progreso (Verde, Amarillo o Rojo)
  obtenerPorcentajeColor(porcentaje: number): string {
    if (porcentaje >= 75) return '#10b981';
    if (porcentaje >= 50) return '#f59e0b';
    return '#ef4444';
  }
}