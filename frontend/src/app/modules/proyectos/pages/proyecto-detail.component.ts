// src/app/modules/proyectos/pages/proyecto-detail.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProyectoService } from '../../../shared/services/proyecto.service';
import { TareaService } from '../../../shared/services/tarea.service';
import { ProyectoConTareas, TareasKanban } from '../../../shared/models/index';
import { KanbanBoardComponent } from '../components/kanban-board.component';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-proyecto-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, KanbanBoardComponent],
  template: `
    <div class="proyecto-detail-container">
      <div *ngIf="cargando" class="loading">
        <div class="spinner"></div>
        <p>Cargando proyecto...</p>
      </div>

      <div *ngIf="!cargando && proyecto" class="proyecto-content">
        <div class="header-detail">
          <button class="btn-volver" (click)="volver()" type="button">← Volver</button>
          <div class="header-info">
            <h1>{{ proyecto.nombre }}</h1>
            <div class="proyecto-meta">
              <span class="meta-item">
                Cliente: <strong>{{ proyecto.cliente?.nombre || 'Interno' }}</strong>
              </span>
              <span class="meta-item">
                Estado: <span class="badge" [style.background-color]="estadoColor">
                  {{ estadoTexto }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="kanban-section" *ngIf="tareasKanban">
          <app-kanban-board
            [tareasKanban]="tareasKanban"
            [idProyecto]="idProyecto"
            (onTareaGuardada)="onTareaGuardada()">
          </app-kanban-board>
        </div>
      </div>

      <div *ngIf="!cargando && !proyecto" class="error-message">
        <p>Error al cargar el proyecto</p>
      </div>
    </div>
  `,
  styles: [`
    .proyecto-detail-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading {
      padding: 60px 20px;
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #ddd;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading p {
      color: #999;
      font-size: 14px;
      margin: 0;
    }

    .proyecto-content {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .header-detail {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .btn-volver {
      background-color: #e0e0e0;
      color: #333;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-volver:hover {
      background-color: #d0d0d0;
    }

    .header-info {
      flex: 1;
    }

    .header-info h1 {
      margin: 0 0 10px;
      font-size: 28px;
      color: #333;
    }

    .proyecto-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .meta-item {
      font-size: 14px;
      color: #666;
    }

    .meta-item strong {
      color: #333;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .kanban-section {
      margin-top: 30px;
    }

    .error-message {
      text-align: center;
      padding: 40px;
      color: #ff6b6b;
    }

    @media (max-width: 768px) {
      .header-detail {
        flex-direction: column;
        align-items: stretch;
      }

      .header-info h1 {
        font-size: 22px;
      }

      .proyecto-meta {
        gap: 10px;
      }
    }
  `]
})
export class ProyectoDetailComponent implements OnInit, OnDestroy {
  proyecto: ProyectoConTareas | null = null;
  tareasKanban: TareasKanban | null = null;
  cargando = true;
  idProyecto: number = 0;

  estadoColor: string = '#666';
  estadoTexto: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private proyectoService: ProyectoService,
    private tareaService: TareaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idProyecto = parseInt(params['id'], 10);
        this.cargarDatosIniciales();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ✅ CORREGIDO: Cargamos el proyecto y el tablero en paralelo usando forkJoin.
   * La vista no cambia a "cargando = false" hasta que AMBOS servicios responden,
   * fulminando el error de bucle infinito NG0103.
   */
  cargarDatosIniciales(): void {
    this.cargando = true;

    forkJoin({
      proyecto: this.proyectoService.obtenerProyecto(this.idProyecto),
      kanban: this.tareaService.obtenerTableroKanban(this.idProyecto)
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (resultado) => {
          this.proyecto = resultado.proyecto;
          this.tareasKanban = resultado.kanban;

          if (this.proyecto) {
            this.calcularValoresEstado(this.proyecto.estado);
          }
        },
        error: (error) => {
          console.error('Error al cargar datos del detalle:', error);
          this.router.navigate(['/proyectos']);
        }
      });
  }

  /**
   * Recarga únicamente el tablero Kanban cuando una tarea es guardada/eliminada/finalizada.
   * Al no tocar la variable 'cargando' general, la recarga es instantánea y transparente.
   */
  cargarKanbanSolo(): void {
    this.tareaService.obtenerTableroKanban(this.idProyecto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.tareasKanban = data;
        },
        error: (error) => {
          console.error('Error al actualizar Kanban:', error);
        }
      });
  }

  private calcularValoresEstado(estado: string): void {
    switch (estado) {
      case 'ACTIVO':
        this.estadoTexto = 'Activo';
        this.estadoColor = '#10b981';
        break;
      case 'FINALIZADO':
        this.estadoTexto = 'Finalizado';
        this.estadoColor = '#3b82f6';
        break;
      case 'BAJA':
        this.estadoTexto = 'Baja';
        this.estadoColor = '#ef4444';
        break;
      default:
        this.estadoTexto = estado;
        this.estadoColor = '#666';
        break;
    }
  }

  onTareaGuardada(): void {
    this.cargarKanbanSolo();
  }

  volver(): void {
    this.router.navigate(['/proyectos']);
  }
}