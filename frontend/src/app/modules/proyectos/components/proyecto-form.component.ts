// ============================================================
// ARCHIVO: src/app/modules/proyectos/components/proyecto-form.component.ts
// ACTUALIZACIÓN: Filtrar clientes ACTIVOS manteniendo el asignado en edición
// ============================================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProyectoService } from '../../../shared/services/proyecto.service';
import { Proyecto, Cliente, EstadoProyecto, EstadoCliente } from '../../../shared/models/index';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-proyecto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="guardar()" class="form">
      <div class="form-group">
        <label for="nombre">Nombre del Proyecto *</label>
        <input
          id="nombre"
          type="text"
          formControlName="nombre"
          placeholder="Ingresa el nombre del proyecto"
          class="input-text"
          [class.input-error]="mostrarErrores && nombre?.invalid">
        <span class="error-text" *ngIf="mostrarErrores && nombre?.invalid">
          {{ getNombreError() }}
        </span>
      </div>

      <div class="form-group">
        <label for="idCliente">Cliente (Opcional)</label>
        <select formControlName="idCliente" class="input-select">
          <option [value]="null">Sin cliente (Proyecto Interno)</option>
          
          <option *ngFor="let cliente of clientesMostrables" [value]="cliente.id">
            {{ cliente.nombre }} {{ cliente.estado === 'BAJA' ? '(Inactivo)' : '' }}
          </option>
        </select>
        
        <span class="advertencia-text" *ngIf="clientesMostrables.length === 0">
          ⚠️ No hay clientes ACTIVOS disponibles. Solo se pueden asignar clientes en estado ACTIVO.
        </span>
      </div>

      <div class="form-group" *ngIf="proyecto">
        <label for="estado">Estado</label>
        <select formControlName="estado" class="input-select">
          <option value="ACTIVO">Activo</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" (click)="cancelar()">
          Cancelar
        </button>
        <button 
          type="submit" 
          class="btn btn-primary" 
          [disabled]="guardando || formulario.invalid">
          <span *ngIf="!guardando">{{ proyecto ? 'Actualizar' : 'Crear' }}</span>
          <span *ngIf="guardando" class="loading-text">
            <span class="mini-spinner"></span> Guardando...
          </span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .input-text,
    .input-select {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    .input-text:focus,
    .input-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .input-error {
      border-color: #ff6b6b;
    }

    .input-error:focus {
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }

    .error-text {
      color: #ff6b6b;
      font-size: 12px;
      margin-top: -5px;
    }

    .advertencia-text {
      color: #ff9800;
      font-size: 12px;
      background-color: #fff3e0;
      padding: 8px;
      border-radius: 4px;
      border-left: 3px solid #ff9800;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background-color: #d0d0d0;
    }

    .loading-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mini-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class ProyectoFormComponent implements OnInit, OnDestroy {
  @Input() proyecto: Proyecto | null = null;
  @Input() clientes: Cliente[] = [];
  @Output() onGuardado = new EventEmitter<void>();
  @Output() onCancelado = new EventEmitter<void>();

  formulario!: FormGroup;
  mostrarErrores = false;
  guardando = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    if (this.proyecto) {
      // Convertir explícitamente a string o número según cómo manejes la consistencia del ID
      const idClienteValue = this.proyecto.idCliente ? Number(this.proyecto.idCliente) : null;
      
      this.formulario.patchValue({
        nombre: this.proyecto.nombre,
        idCliente: idClienteValue,
        estado: this.proyecto.estado
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      idCliente: [null],
      estado: [EstadoProyecto.ACTIVO]
    });
  }

  /**
   * ✅ GETTER SEGURO: Retorna los clientes en estado ACTIVO 
   * MÁS el cliente actualmente asignado al proyecto (evita romper la selección en edición)
   */
  get clientesMostrables(): Cliente[] {
    return this.clientes.filter(c => {
      const esActivo = c.estado === EstadoCliente.ACTIVO;
      const esElClienteAsignado = this.proyecto && Number(this.proyecto.idCliente) === Number(c.id);
      return esActivo || esElClienteAsignado;
    });
  }

  guardar(): void {
    this.mostrarErrores = false;

    if (this.formulario.invalid) {
      this.mostrarErrores = true;
      return;
    }

    this.guardando = true;
    const datos = this.formulario.value;

    // Normalización para enviar tipos correctos (select strings "null" a null real)
    const idClienteFinal = (datos.idCliente === 'null' || datos.idCliente === null) ? null : Number(datos.idCliente);

    const payload = {
      nombre: datos.nombre,
      idCliente: idClienteFinal,
      estado: datos.estado
    };

    if (this.proyecto) {
      this.proyectoService.actualizarProyecto(this.proyecto.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.guardando = false;
            this.onGuardado.emit();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            alert(error.error?.message || 'Error al actualizar el proyecto');
            this.guardando = false;
          }
        });
    } else {
      this.proyectoService.crearProyecto({
        nombre: payload.nombre,
        idCliente: payload.idCliente
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.guardando = false;
            this.onGuardado.emit();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            alert(error.error?.message || 'Error al crear el proyecto');
            this.guardando = false;
          }
        });
    }
  }

  cancelar(): void {
    this.onCancelado.emit();
  }

  get nombre() {
    return this.formulario.get('nombre');
  }

  getNombreError(): string {
    if (this.nombre?.errors?.['required']) return 'El nombre es requerido';
    if (this.nombre?.errors?.['minlength']) return 'El nombre debe tener al menos 3 caracteres';
    return '';
  }
}