import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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
    MatButtonModule
  ],
  templateUrl: './project-form.html'
})
export class ProjectForm implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<ProjectForm>);

  clientes: any[] = [];
  
  projectForm = this.fb.group({
    nombre: ['', [Validators.required]],
    id_cliente: [null], 
    estado: ['ACTIVO'] // Cumple con el ENUM de tu DB
  });

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.http.get<any[]>(`${environment.apiUrl}/gestion/clientes`).subscribe({
      next: (res) => {
        // Filtramos por clientes activos como pide la consigna
        this.clientes = res.filter(c => c.estado === 'ACTIVO');
      },
      error: (err) => console.error('Error cargando clientes', err)
    });
  }

  guardar() {
    if (this.projectForm.valid) {
      this.http.post(`${environment.apiUrl}/gestion/proyectos`, this.projectForm.value)
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => alert('No se pudo guardar el proyecto. Revisá el backend.')
        });
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}