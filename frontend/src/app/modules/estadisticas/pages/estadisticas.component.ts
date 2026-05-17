// src/app/modules/estadisticas/pages/estadisticas.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // ✅ Agregado ChangeDetectorRef
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

  // ✅ Inyectamos cdr en el constructor
  constructor(
    private estadisticasService: EstadisticasService,
    private cdr: ChangeDetectorRef
  ) {}

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
          this.verificarFinCarga(); // ✅ Comprueba si ya terminó todo
        },
        error: (error) => {
          console.error('Error al cargar resumen:', error);
          this.verificarFinCarga();
        }
      });

    this.estadisticasService.obtenerEstadisticasPorCliente()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.estadisticasPorCliente = data;
          this.verificarFinCarga(); // ✅ Comprueba si ya terminó todo
        },
        error: (error) => {
          console.error('Error al cargar estadísticas por cliente:', error);
          this.verificarFinCarga();
        }
      });

    this.estadisticasService.obtenerEstadisticasPorProyecto()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.estadisticasPorProyecto = data;
          this.verificarFinCarga(); // ✅ Comprueba si ya terminó todo
        },
        error: (error) => {
          console.error('Error al cargar estadísticas por proyecto:', error);
          this.verificarFinCarga();
        }
      });
  }

  // ✅ Nueva función auxiliar para apagar el spinner de forma segura y forzar el redibujado
  private verificarFinCarga(): void {
    // Si ya tenemos respuestas (o intentos fallidos) de los flujos principales, apagamos el spinner
    if (this.resumen !== null || this.estadisticasPorCliente.length > 0 || this.estadisticasPorProyecto.length > 0) {
      this.cargando = false;
      
      // 🚀 FORZAMOS A ANGULAR A DESPERTAR Y REDIBUJAR
      this.cdr.detectChanges(); 
    }
  }

  // Define dinámicamente el color de la barra de progreso (Verde, Amarillo o Rojo)
  obtenerPorcentajeColor(porcentaje: number): string {
    if (porcentaje >= 75) return '#10b981';
    if (porcentaje >= 50) return '#f59e0b';
    return '#ef4444';
  }
}