// src/app/modules/proyectos/components/tarea-form.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TareaService } from '../../../shared/services/tarea.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tarea-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="guardar()" class="form">
      <div class="form-group">
        <label for="descripcion">Descripción de la Tarea *</label>
        <textarea
          id="descripcion"
          formControlName="descripcion"
          placeholder="Describe la tarea..."
          rows="4"
          class="input-textarea"
          [class.input-error]="mostrarErrores && descripcion?.invalid">
        </textarea>
        <span class="error-text" *ngIf="mostrarErrores && descripcion?.invalid">
          {{ getDescripcionError() }}
        </span>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" (click)="cancelar()">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" [disabled]="guardando || formulario.invalid">
          <span *ngIf="!guardando">Crear Tarea</span>
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

    .input-textarea {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      transition: all 0.3s ease;
    }

    .input-textarea:focus {
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
export class TareaFormComponent implements OnInit, OnDestroy {
  // Recibe obligatoriamente el ID del proyecto al que se le va a anexar la nueva tarea
  @Input() idProyecto!: number;
  @Output() onGuardado = new EventEmitter<void>();
  @Output() onCancelado = new EventEmitter<void>();

  formulario!: FormGroup;
  mostrarErrores = false;
  guardando = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private tareaService: TareaService
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializa el control reactivo con su regla de longitud mínima
  crearFormulario(): void {
    this.formulario = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  // Envía la nueva tarea a la API vinculándola al proyecto correspondiente
  guardar(): void {
    this.mostrarErrores = false;

    if (this.formulario.invalid) {
      this.mostrarErrores = true;
      return;
    }

    this.guardando = true;
    const datos = this.formulario.value;

    this.tareaService.crearTarea(this.idProyecto, {
      descripcion: datos.descripcion
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.onGuardado.emit();
          this.formulario.reset(); 
        },
        error: (error) => {
          console.error('Error al crear la tarea:', error);
          this.guardando = false;
        }
      });
  }

  cancelar(): void {
    this.onCancelado.emit();
  }

  // Getter para abreviar el acceso a las validaciones del campo en la vista HTML
  get descripcion() {
    return this.formulario.get('descripcion');
  }

  // Helper para alternar las strings de error de la descripción
  getDescripcionError(): string {
    if (this.descripcion?.errors?.['required']) return 'La descripción es requerida';
    if (this.descripcion?.errors?.['minlength']) return 'La descripción debe tener al menos 5 caracteres';
    return '';
  }
}