//frontend/src/app/modules/clientes/componentscliente-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../../shared/services/cliente.service';
import { Cliente, EstadoCliente } from '../../../shared/models/index';
import { Subject, Observable } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="onGuardar()" class="form">
      
      <div *ngIf="mensajeError" class="mensaje-error-box">
        <p>⚠️ {{ mensajeError }}</p>
      </div>

      <div class="form-group">
        <label for="nombre">Nombre del Cliente *</label>
        <input
          id="nombre"
          type="text"
          formControlName="nombre"
          placeholder="Ingresa el nombre del cliente"
          class="input-text"
          [class.input-error]="mostrarErrores && nombre?.invalid"
          [disabled]="isGuardando">
        <span class="error-text" *ngIf="mostrarErrores && nombre?.invalid">
          {{ getNombreError() }}
        </span>
      </div>

      <div class="form-group" *ngIf="cliente">
        <label for="estado">Estado</label>
        <select formControlName="estado" class="input-select" [disabled]="isGuardando">
          <option value="ACTIVO">Activo</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-secondary" 
          (click)="onCancelar()" 
          [disabled]="isGuardando">
          Cancelar
        </button>
        <button 
          type="submit" 
          class="btn btn-primary" 
          [disabled]="isGuardando || formulario.invalid">
          <span *ngIf="!isGuardando">{{ cliente ? 'Actualizar' : 'Crear' }}</span>
          <span *ngIf="isGuardando" class="loading-text">
            <span class="mini-spinner"></span> Guardando...
          </span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-weight: 600; color: #333; font-size: 14px; }
    .input-text, .input-select { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .input-text:focus, .input-select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .input-error { border-color: #ff6b6b; background-color: #fff5f5; }
    .error-text { color: #ff6b6b; font-size: 12px; margin-top: -5px; }
    .mensaje-error-box { background-color: #fee2e2; border: 1px solid #f87171; color: #b91c1c; padding: 12px; border-radius: 6px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .mensaje-error-box p { margin: 0; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 10px; }
    .btn { padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover:not(:disabled) { background: #5568d3; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
    .btn-secondary { background: #e0e0e0; color: #333; }
    .btn-secondary:hover:not(:disabled) { background: #d0d0d0; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .loading-text { display: flex; align-items: center; gap: 6px; }
    .mini-spinner { width: 14px; height: 14px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ClienteFormComponent implements OnInit, OnDestroy {
  @Input() cliente: Cliente | null = null;
  @Output() onGuardado = new EventEmitter<void>();
  @Output() onCancelado = new EventEmitter<void>();

  formulario!: FormGroup;
  mostrarErrores = false;
  isGuardando = false;
  mensajeError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    if (this.cliente) {
      this.cargarDatosCliente();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private crearFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      estado: [EstadoCliente.ACTIVO]
    });
  }

  private cargarDatosCliente(): void {
    if (this.cliente) {
      this.formulario.patchValue({
        nombre: this.cliente.nombre,
        estado: this.cliente.estado || EstadoCliente.ACTIVO
      });
    }
  }

  onGuardar(): void {
    this.mensajeError = null;

    if (this.formulario.invalid) {
      this.mostrarErrores = true;
      return;
    }

    this.mostrarErrores = false;
    this.isGuardando = true;

    const formData = this.formulario.value;
    const datosEnvio = {
      nombre: formData.nombre.trim(),
      estado: formData.estado
    };

    // CORRECCIÓN: Se cambió el tipo a Observable<any> para evitar el error TS2322
    const operacion$: Observable<any> = this.cliente
      ? this.clienteService.actualizarCliente(this.cliente.id, datosEnvio)
      : this.clienteService.crearCliente(datosEnvio);

    operacion$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isGuardando = false;
        })
      )
      .subscribe({
        next: (respuesta: Cliente) => {
          console.log('✅ Operación exitosa:', respuesta);
          this.onGuardado.emit();
          this.limpiarFormulario();
        },
        error: (error: HttpErrorResponse) => {
          console.error('❌ Error en la solicitud:', error);
          this.manejarError(error);
        }
      });
  }

  onCancelar(): void {
    this.limpiarFormulario();
    this.onCancelado.emit();
  }

  private limpiarFormulario(): void {
    this.formulario.reset({
      nombre: '',
      estado: EstadoCliente.ACTIVO
    });
    this.mostrarErrores = false;
    this.mensajeError = null;
  }

  private manejarError(error: HttpErrorResponse): void {
    let mensajeError = 'Error al procesar la solicitud';

    if (error.error) {
      if (typeof error.error === 'string') {
        mensajeError = error.error;
      } else if (error.error.message) {
        mensajeError = error.error.message;
      } else if (error.error.error) {
        mensajeError = error.error.error;
      }
    } else if (error.message) {
      mensajeError = error.message;
    } else if (error.status === 0) {
      mensajeError = 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      mensajeError = `Error ${error.status}: ${error.statusText}`;
    }

    this.mensajeError = mensajeError;
  }

  get nombre() {
    return this.formulario.get('nombre');
  }

  getNombreError(): string {
    const control = this.nombre;
    if (!control) return '';
    if (control.errors?.['required']) return 'El nombre es requerido';
    if (control.errors?.['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    return '';
  }
}