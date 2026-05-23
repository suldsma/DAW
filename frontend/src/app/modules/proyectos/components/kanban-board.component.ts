import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  CdkDragDrop, 
  DragDropModule, 
  moveItemInArray, 
  transferArrayItem 
} from '@angular/cdk/drag-drop';
import { TareasKanban, EstadoTarea } from '../../../shared/models/index';
import { TareaFormComponent } from './tarea-form.component';
import { TareaService } from '../../../shared/services/tarea.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, TareaFormComponent, DragDropModule],
  template: `
    <div class="kanban-container">
      <h2 class="kanban-title">Tablero de Tareas</h2>

      <div class="kanban-board">
        <!-- Columna Pendientes -->
        <div class="kanban-column">
          <div class="column-header">
            <h3>Pendientes</h3>
            <span class="count">{{ tareasKanban.PENDIENTE.length || 0 }}</span>
          </div>

          <div class="column-content">
            <div class="card-add">
              <button (click)="abrirFormularioTarea()" type="button" [disabled]="cargando">✚ Agregar Tarea</button>
            </div>

            <div class="cards-list" 
                 cdkDropList 
                 id="pendientes-list"
                 [cdkDropListData]="tareasKanban.PENDIENTE"
                 [cdkDropListConnectedTo]="['finalizadas-list']"
                 (cdkDropListDropped)="onDrop($event)">
                 
              <div class="card" *ngFor="let tarea of tareasKanban.PENDIENTE" cdkDrag [cdkDragData]="tarea">
                <div class="card-header">
                  <h4>{{ tarea?.descripcion }}</h4>
                  <div class="card-actions">
                    <button class="btn-icon btn-check" (click)="finalizarTarea(tarea)" title="Finalizar tarea" type="button" [disabled]="cargando">✓</button>
                    <button class="btn-icon btn-delete" (click)="eliminarTarea(tarea)" title="Eliminar tarea" type="button" [disabled]="cargando">✕</button>
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

        <!-- Columna Finalizadas -->
        <div class="kanban-column">
          <div class="column-header">
            <h3>Finalizadas</h3>
            <span class="count">{{ tareasKanban.FINALIZADA.length || 0 }}</span>
          </div>

          <div class="column-content">
            <div class="cards-list" 
                 cdkDropList 
                 id="finalizadas-list"
                 [cdkDropListData]="tareasKanban.FINALIZADA"
                 [cdkDropListConnectedTo]="['pendientes-list']"
                 (cdkDropListDropped)="onDrop($event)">
                 
              <div class="card completed" *ngFor="let tarea of tareasKanban.FINALIZADA" cdkDrag [cdkDragData]="tarea">
                <div class="card-header">
                  <h4>{{ tarea?.descripcion }}</h4>
                  <button class="btn-icon btn-delete" (click)="eliminarTarea(tarea)" title="Eliminar tarea" type="button" [disabled]="cargando">✕</button>
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

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="mostrarFormularioTarea" (click)="cerrarFormularioTarea()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Crear Tarea</h2>
            <button class="btn-close" (click)="cerrarFormularioTarea()" type="button" [disabled]="cargando">✕</button>
          </div>
          <div class="modal-body">
            <app-tarea-form [idProyecto]="idProyecto" (onGuardado)="onTareaCreada()" (onCancelado)="cerrarFormularioTarea()"></app-tarea-form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos base del CDK para el drag and drop */
    .cdk-drag-preview { box-shadow: 0 5px 15px rgba(0,0,0,0.2); cursor: grabbing; }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    
    /* ... (resto de tus estilos originales se mantienen) ... */
    .kanban-container { width: 100%; }
    .kanban-board { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .kanban-column { background: #f9f9f9; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; min-height: 500px; }
    .column-header { background-color: #f5f5f5; border-bottom: 2px solid #ddd; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
    .column-content { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 15px; }
    .card { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #fbbf24; box-shadow: 0 2px 5px rgba(0,0,0,0.08); cursor: grab; }
    .card.completed { border-left-color: #10b981; }
  `]
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  @Input() tareasKanban: TareasKanban = { PENDIENTE: [], FINALIZADA: [] };
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

  // Lógica de Drag & Drop
  onDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const tarea = event.item.data;
      const nuevoEstado = event.container.id === 'finalizadas-list' ? EstadoTarea.FINALIZADA : EstadoTarea.PENDIENTE;
      this.actualizarEstado(tarea.id, nuevoEstado);
    }
  }

  actualizarEstado(idTarea: number, nuevoEstado: EstadoTarea): void {
    this.cargando = true;
    this.tareaService.actualizarTarea(this.idProyecto, idTarea, { estado: nuevoEstado })
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: () => this.onTareaGuardada.emit(),
        error: () => { alert('Error al mover tarea'); this.onTareaGuardada.emit(); }
      });
  }

  // Métodos auxiliares
  abrirFormularioTarea(): void { this.mostrarFormularioTarea = true; }
  cerrarFormularioTarea(): void { this.mostrarFormularioTarea = false; }
  onTareaCreada(): void { this.cerrarFormularioTarea(); this.onTareaGuardada.emit(); }

  finalizarTarea(tarea: any): void {
    this.actualizarEstado(tarea.id, EstadoTarea.FINALIZADA);
  }

  eliminarTarea(tarea: any): void {
    if (!confirm('¿Estás seguro que deseas eliminar esta tarea?')) return;
    this.cargando = true;
    this.tareaService.eliminarTarea(this.idProyecto, tarea.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: () => this.onTareaGuardada.emit(),
        error: () => alert('Error al eliminar la tarea')
      });
  }
}