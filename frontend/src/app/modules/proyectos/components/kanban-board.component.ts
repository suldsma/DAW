// src/app/modules/proyectos/components/kanban-board.component.ts

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareasKanban, EstadoTarea } from '../../../shared/models/index';
import { TareaFormComponent } from './tarea-form.component';
import { TareaService } from '../../../shared/services/tarea.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, TareaFormComponent],
  template: `
    <div class="kanban-container">
      <h2 class="kanban-title">Tablero de Tareas</h2>

      <div class="kanban-board">
        <div class="kanban-column">
          <div class="column-header">
            <h3>Pendientes</h3>
            <span class="count">{{ tareasKanban.PENDIENTE.length || 0 }}</span>
          </div>

          <div class="column-content">
            <div class="card-add">
              <button (click)="abrirFormularioTarea()" type="button" [disabled]="cargando">
                ✚ Agregar Tarea
              </button>
            </div>

            <div class="cards-list">
              <div class="card" *ngFor="let tarea of tareasKanban.PENDIENTE || []">
                <div class="card-header">
                  <h4>{{ tarea.descripcion }}</h4>
                  <div class="card-actions">
                    <button
                      class="btn-icon btn-check"
                      (click)="finalizarTarea(tarea)"
                      title="Finalizar tarea"
                      type="button"
                      [disabled]="cargando">
                      ✓
                    </button>
                    <button
                      class="btn-icon btn-delete"
                      (click)="eliminarTarea(tarea)"
                      title="Eliminar tarea"
                      type="button"
                      [disabled]="cargando">
                      ✕
                    </button>
                  </div>
                </div>
                <span class="badge badge-pendiente">Pendiente</span>
              </div>

              <div class="empty" *ngIf="!tareasKanban.PENDIENTE || tareasKanban.PENDIENTE.length === 0">
                <p>No hay tareas pendientes</p>
              </div>
            </div>
          </div>
        </div>

        <div class="kanban-column">
          <div class="column-header">
            <h3>Finalizadas</h3>
            <span class="count">{{ tareasKanban.FINALIZADA.length || 0 }}</span>
          </div>

          <div class="column-content">
            <div class="cards-list">
              <div class="card completed" *ngFor="let tarea of tareasKanban.FINALIZADA || []">
                <div class="card-header">
                  <h4>{{ tarea.descripcion }}</h4>
                  <button
                    class="btn-icon btn-delete"
                    (click)="eliminarTarea(tarea)"
                    title="Eliminar tarea"
                    type="button"
                    [disabled]="cargando">
                    ✕
                  </button>
                </div>
                <span class="badge badge-finalizada">Finalizada</span>
              </div>

              <div class="empty" *ngIf="!tareasKanban.FINALIZADA || tareasKanban.FINALIZADA.length === 0">
                <p>No hay tareas finalizadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="mostrarFormularioTarea" (click)="cerrarFormularioTarea()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Crear Tarea</h2>
            <button 
              class="btn-close" 
              (click)="cerrarFormularioTarea()" 
              type="button"
              [disabled]="cargando">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <app-tarea-form
              [idProyecto]="idProyecto"
              (onGuardado)="onTareaCreada()"
              (onCancelado)="cerrarFormularioTarea()">
            </app-tarea-form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-container {
      width: 100%;
    }

    .kanban-title {
      margin: 0 0 20px;
      font-size: 24px;
      color: #333;
      font-weight: 600;
    }

    .kanban-board {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .kanban-column {
      background: #f9f9f9;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 500px;
    }

    .column-header {
      background-color: #f5f5f5;
      border-bottom: 2px solid #ddd;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .column-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
    }

    .count {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .column-content {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .card-add {
      width: 100%;
    }

    .card-add button {
      width: 100%;
      padding: 12px;
      border: 2px dashed #667eea;
      background: white;
      color: #667eea;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .card-add button:hover:not(:disabled) {
      background: #f0f0f0;
      border-color: #764ba2;
    }

    .card-add button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .card {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #fbbf24;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .card.completed {
      border-left-color: #10b981;
      opacity: 0.8;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }

    .card-header h4 {
      margin: 0;
      font-size: 14px;
      color: #333;
      flex: 1;
      line-height: 1.4;
      word-break: break-word;
    }

    .card.completed h4 {
      text-decoration: line-through;
      color: #999;
    }

    .card-actions {
      display: flex;
      gap: 5px;
      flex-shrink: 0;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 3px 6px;
      transition: all 0.2s ease;
      color: #667eea;
    }

    .btn-icon:hover:not(:disabled) {
      transform: scale(1.2);
    }

    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-check {
      color: #10b981;
    }

    .btn-delete {
      color: #ff6b6b;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: white;
    }

    .badge-pendiente {
      background-color: #fbbf24;
    }

    .badge-finalizada {
      background-color: #10b981;
    }

    .empty {
      padding: 30px 10px;
      text-align: center;
      color: #999;
      font-size: 13px;
      margin: auto 0;
    }

    .empty p {
      margin: 0;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal {
      background: white;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: #333;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;
    }

    .btn-close:hover:not(:disabled) {
      color: #333;
    }

    .btn-close:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal-body {
      padding: 20px;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .kanban-board {
        grid-template-columns: 1fr;
      }

      .kanban-column {
        min-height: 400px;
      }

      .modal {
        max-width: 90%;
      }
    }
  `]
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  @Input() tareasKanban!: TareasKanban;
  @Input() idProyecto!: number;
  @Output() onTareaGuardada = new EventEmitter<void>();

  mostrarFormularioTarea = false;
  cargando = false;

  private destroy$ = new Subject<void>();

  constructor(private tareaService: TareaService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirFormularioTarea(): void {
    this.mostrarFormularioTarea = true;
  }

  cerrarFormularioTarea(): void {
    this.mostrarFormularioTarea = false;
  }

  onTareaCreada(): void {
    this.cerrarFormularioTarea();
    this.onTareaGuardada.emit();
  }

  finalizarTarea(tarea: any): void {
    this.cargando = true;

    this.tareaService.actualizarTarea(this.idProyecto, tarea.id, {
      estado: EstadoTarea.FINALIZADA
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false) 
      )
      .subscribe({
        next: () => {
          this.onTareaGuardada.emit();
        },
        error: (error) => {
          console.error('Error al finalizar tarea:', error);
          alert('Error al finalizar la tarea');
        }
      });
  }

  eliminarTarea(tarea: any): void {
    if (!confirm('¿Estás seguro que deseas eliminar esta tarea?')) {
      return;
    }

    this.cargando = true;

    this.tareaService.eliminarTarea(this.idProyecto, tarea.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false) 
      )
      .subscribe({
        next: () => {
          this.onTareaGuardada.emit();
        },
        error: (error) => {
          console.error('Error al eliminar tarea:', error);
          alert('Error al eliminar la tarea');
        }
      });
  }
}