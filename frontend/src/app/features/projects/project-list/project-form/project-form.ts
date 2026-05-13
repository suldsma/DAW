import { Component, inject, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Importamos los módulos de Material uno por uno para evitar errores NG8001
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './project-form.html'
})
export class ProjectForm implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<ProjectForm>);
  private snackBar = inject(MatSnackBar);
  
  // ✅ Inyectar datos del proyecto si se está editando
  @Optional()
  @Inject(MAT_DIALOG_DATA)
  data: { proyecto?: any } = {};

  clientes: any[] = [];
  isEditing: boolean = false; // ✅ Bandera para saber si estamos editando
  
  projectForm = this.fb.group({
    nombre: ['', [Validators.required]],
    idCliente: [null], 
    estado: ['ACTIVO']
  });

  ngOnInit() {
    this.cargarClientes();
    
    // ✅ Si hay datos (edición), pre-rellenar el formulario
    if (this.data?.proyecto) {
      this.isEditing = true;
      this.projectForm.patchValue({
        nombre: this.data.proyecto.nombre,
        idCliente: this.data.proyecto.cliente?.id || null,
        estado: this.data.proyecto.estado
      });
    }
  }

  cargarClientes() {
    // ✅ Actualizar URL sin /gestion/
    this.http.get<any[]>(`${environment.apiUrl}/clientes`).subscribe({
      next: (res) => {
        // Filtramos por clientes activos como pide la consigna
        this.clientes = res.filter(c => c.estado === 'ACTIVO');
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 5000 });
      }
    });
  }

  guardar() {
    if (this.projectForm.valid) {
      const datosProyecto = this.projectForm.value;

      // ✅ Si estamos editando, hacer PUT; si no, hacer POST
      if (this.isEditing) {
        this.http.put(`${environment.apiUrl}/proyectos/${this.data.proyecto.id}`, datosProyecto)
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: (err) => {
              console.error('Error actualizando proyecto', err);
              this.snackBar.open('Error al actualizar el proyecto', 'Cerrar', { duration: 5000 });
            }
          });
      } else {
        this.http.post(`${environment.apiUrl}/proyectos`, datosProyecto)
          .subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: (err) => {
              console.error('Error creando proyecto', err);
              this.snackBar.open('Error al guardar el proyecto. Verifica el backend.', 'Cerrar', { duration: 5000 });
            }
          });
      }
    } else {
      this.snackBar.open('Por favor completa los campos obligatorios', 'Cerrar', { duration: 3000 });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}