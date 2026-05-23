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
  FormsModule, 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators 
} from '@angular/forms';
import { ProyectoService } from '../../../shared/services/proyecto.service';
import { 
  Proyecto, 
  Cliente, 
  EstadoProyecto, 
  EstadoCliente 
} from '../../../shared/models/index';
import { Subject, Observable } from 'rxjs'; 
import { takeUntil, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-proyecto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="guardar()" class="form">
      <div class="form-group">
        <label for="nombre">Nombre del Proyecto *</label>
        <input id="nombre" type="text" formControlName="nombre" class="input-text" [class.input-error]="mostrarErrores && nombre?.invalid" [disabled]="guardando">
        <span class="error-text" *ngIf="mostrarErrores && nombre?.invalid">{{ getNombreError() }}</span>
      </div>
      <div class="form-group">
        <label for="idCliente">Cliente (Opcional)</label>
        <select id="idCliente" formControlName="idCliente" class="input-select" [disabled]="guardando">
          <option [ngValue]="null">Sin cliente (Proyecto Interno)</option>
          <option *ngFor="let cliente of clientesMostrables" [ngValue]="cliente.id">{{ cliente.nombre }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="fechaFinalizacion">Fecha de Finalización Objetivo</label>
        <input id="fechaFinalizacion" type="date" formControlName="fechaFinalizacionObjetivo" class="input-text" [disabled]="guardando">
        <span class="help-text" *ngIf="formulario.get('fechaFinalizacionObjetivo')?.value">{{ diasRestantes }} días restantes</span>
      </div>
      <div class="form-group" *ngIf="proyecto">
        <label for="estado">Estado</label>
        <select id="estado" formControlName="estado" class="input-select" [disabled]="guardando">
          <option value="ACTIVO">Activo</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" (click)="cancelar()" [disabled]="guardando">Cancelar</button>
        <button type="submit" class="btn btn-primary" [disabled]="guardando || formulario.invalid">
          <span *ngIf="!guardando">{{ proyecto ? 'Actualizar' : 'Crear' }}</span>
          <span *ngIf="guardando" class="loading-text"><span class="mini-spinner"></span> Guardando...</span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .input-text, .input-select { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #e0e0e0; }
    .mini-spinner { width: 12px; height: 12px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
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

  constructor(private fb: FormBuilder, private proyectoService: ProyectoService) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    if (this.proyecto) {
      this.formulario.patchValue({
        nombre: this.proyecto.nombre,
        idCliente: this.proyecto.idCliente ? Number(this.proyecto.idCliente) : null,
        estado: this.proyecto.estado,
        fechaFinalizacionObjetivo: this.proyecto.fechaFinalizacionObjetivo
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
      estado: [EstadoProyecto.ACTIVO],
      fechaFinalizacionObjetivo: [null]
    });
  }

  get diasRestantes(): number {
    const fechaValor = this.formulario.get('fechaFinalizacionObjetivo')?.value;
    if (!fechaValor) return 0;
    const fecha = new Date(fechaValor);
    const hoy = new Date();
    fecha.setHours(0, 0, 0, 0); hoy.setHours(0, 0, 0, 0);
    return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
  }

  guardar(): void {
    this.mostrarErrores = false;
    if (this.formulario.invalid) { this.mostrarErrores = true; return; }

    this.guardando = true;
    const datos = this.formulario.value;
    const payload = {
      nombre: datos.nombre.trim(),
      idCliente: datos.idCliente ? Number(datos.idCliente) : null,
      estado: datos.estado,
      fechaFinalizacionObjetivo: datos.fechaFinalizacionObjetivo || null
    };

    const operacion: Observable<any> = this.proyecto 
      ? this.proyectoService.actualizarProyecto(this.proyecto.id, payload)
      : this.proyectoService.crearProyecto(payload);

    operacion.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.guardando = false)
    ).subscribe({
      next: () => this.onGuardado.emit(),
      error: (err: HttpErrorResponse) => alert(err.error?.message || 'Error al guardar')
    });
  }

  cancelar(): void {
    this.formulario.reset({ nombre: '', idCliente: null, estado: EstadoProyecto.ACTIVO, fechaFinalizacionObjetivo: null });
    this.onCancelado.emit();
  }

  get nombre() { return this.formulario.get('nombre'); }
  getNombreError(): string {
    if (this.nombre?.errors?.['required']) return 'El nombre es requerido';
    if (this.nombre?.errors?.['minlength']) return 'Mínimo 3 caracteres';
    return '';
  }
  get clientesMostrables(): Cliente[] {
    return this.clientes.filter(c => c.estado === EstadoCliente.ACTIVO);
  }
}