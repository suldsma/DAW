// src/app/modules/clientes/components/cliente-form.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../../shared/services/cliente.service';
import { Cliente, EstadoCliente } from '../../../shared/models/index';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="guardar()" class="form">
      <div class="form-group">
        <label for="nombre">Nombre del Cliente *</label>
        <input
          id="nombre"
          type="text"
          formControlName="nombre"
          placeholder="Ingresa el nombre del cliente"
          class="input-text"
          [class.input-error]="mostrarErrores && nombre?.invalid"
          [disabled]="guardando">
        <span class="error-text" *ngIf="mostrarErrores && nombre?.invalid">
          {{ getNombreError() }}
        </span>
      </div>

      <div class="form-group" *ngIf="cliente">
        <label for="estado">Estado</label>
        <select formControlName="estado" class="input-select" [disabled]="guardando">
          <option [value]="'ACTIVO'">Activo</option>
          <option [value]="'BAJA'">Baja</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" (click)="cancelar()" [disabled]="guardando">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" [disabled]="guardando || formulario.invalid">
          <span *ngIf="!guardando">{{ cliente ? 'Actualizar' : 'Crear' }}</span>
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

    .input-text:disabled,
    .input-select:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
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

    .btn-secondary:hover:not(:disabled) {
      background-color: #d0d0d0;
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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
      to { transform: rotate(360deg); }
    }
  `]
})
export class ClienteFormComponent implements OnInit, OnDestroy {
  @Input() cliente: Cliente | null = null;
  @Output() onGuardado = new EventEmitter<void>();
  @Output() onCancelado = new EventEmitter<void>();

  formulario!: FormGroup;
  mostrarErrores = false;
  guardando = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    if (this.cliente) {
      this.formulario.patchValue({
        nombre: this.cliente.nombre,
        estado: this.cliente.estado
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      estado: [EstadoCliente.ACTIVO]
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

    if (this.cliente) {
      const payloadActualizar = {
        nombre: datos.nombre.trim(),
        estado: datos.estado
      };

      this.clienteService.actualizarCliente(this.cliente.id, payloadActualizar)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.guardando = false)
        )
        .subscribe({
          next: () => {
            this.onGuardado.emit();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            alert('❌ Error al actualizar el cliente');
          }
        });
    } else {
      const payloadCrear = {
        nombre: datos.nombre.trim()
      };

      this.clienteService.crearCliente(payloadCrear)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.guardando = false)
        )
        .subscribe({
          next: () => {
            this.formulario.reset({ nombre: '', estado: EstadoCliente.ACTIVO });
            this.onGuardado.emit();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            alert('❌ Error al crear el cliente. Si el nombre ya existe, elegí uno diferente.');
          }
        });
    }
  }

  cancelar(): void {
    this.formulario.reset({ nombre: '', estado: EstadoCliente.ACTIVO });
    this.mostrarErrores = false;
    this.onCancelado.emit();
  }

  get nombre() {
    return this.formulario.get('nombre');
  }

  getNombreError(): string {
    if (this.nombre?.errors?.['required']) return 'El nombre es requerido';
    if (this.nombre?.errors?.['minlength']) return 'El nombre debe tener al menos 2 caracteres';
    return '';
  }
}