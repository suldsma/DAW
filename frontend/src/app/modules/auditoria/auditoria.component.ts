import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService, RegistroAuditoria } from '../../shared/services/auditoria.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auditoria-container">
      <h1>Historial de Auditoría</h1>

      <div class="filtros-section">
        <div class="filtro-group">
          <label>Tipo de Operación:</label>
          <select [(ngModel)]="filtroOperacion" (change)="cargarHistorial()">
            <option value="">Todas</option>
            <option value="CREAR">Crear</option>
            <option value="ACTUALIZAR">Actualizar</option>
            <option value="ELIMINAR">Eliminar</option>
          </select>
        </div>
      </div>

      <div *ngIf="cargando" class="loading">
        <div class="spinner"></div>
        <p>Cargando historial...</p>
      </div>

      <div *ngIf="!cargando && registros.length > 0" class="tabla-container">
        <table class="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Entidad</th>
              <th>Operación</th>
              <th>ID Entidad</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let reg of registros">
              <td>{{ reg.fechaOperacion | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ reg.nombreUsuario }}</td>
              <td>{{ obtenerTextoEntidad(reg.tipoEntidad) }}</td>
              <td>
                <span class="badge" [style.background-color]="obtenerColorOperacion(reg.tipoOperacion)">
                  {{ reg.tipoOperacion }}
                </span>
              </td>
              <td>{{ reg.idEntidad }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!cargando && registros.length === 0" class="empty-state">
        <p>No hay registros de auditoría</p>
      </div>
    </div>
  `,
  styles: [`
    .auditoria-container { width: 100%; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 30px; font-size: 32px; color: #333; }
    .filtros-section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 15px; }
    .filtro-group { display: flex; flex-direction: column; gap: 5px; }
    .filtro-group label { font-weight: 600; color: #666; font-size: 13px; }
    select { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .tabla-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .tabla { width: 100%; border-collapse: collapse; }
    .tabla thead { background-color: #f5f5f5; border-bottom: 2px solid #ddd; }
    .tabla th { padding: 15px; text-align: left; font-weight: 600; color: #333; text-transform: uppercase; font-size: 13px; }
    .tabla td { padding: 15px; border-bottom: 1px solid #eee; color: #666; font-size: 14px; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: 600; }
    .loading { padding: 60px 20px; text-align: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #ddd; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { padding: 60px 20px; text-align: center; color: #999; }
  `]
})
export class AuditoriaComponent implements OnInit, OnDestroy {
  registros: RegistroAuditoria[] = [];
  cargando = false;
  filtroOperacion = '';

  private destroy$ = new Subject<void>();

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.auditoriaService.obtenerHistorialGeneral(500)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: RegistroAuditoria[]) => {
          this.registros = this.filtroOperacion
            ? data.filter((r: RegistroAuditoria) => r.tipoOperacion === this.filtroOperacion)
            : data;
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('Error al cargar auditoría:', error);
          this.cargando = false;
        }
      });
  }

  obtenerTextoEntidad(tipo: string): string {
    const map: {[key: string]: string} = {
      'USUARIO': 'Usuario',
      'CLIENTE': 'Cliente',
      'PROYECTO': 'Proyecto',
      'TAREA': 'Tarea'
    };
    return map[tipo] || tipo;
  }

  obtenerColorOperacion(operacion: string): string {
    const colors: {[key: string]: string} = {
      'CREAR': '#10b981',
      'ACTUALIZAR': '#3b82f6',
      'ELIMINAR': '#ef4444'
    };
    return colors[operacion] || '#666';
  }
}