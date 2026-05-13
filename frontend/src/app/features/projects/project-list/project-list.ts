import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

// Importaciones de Material necesarias
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Importar el componente de formulario
import { ProjectForm } from './project-form/project-form';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar); // ✅ Para notificaciones
  private router = inject(Router); // ✅ Para navegación
  
  proyectos: any[] = [];
  displayedColumns: string[] = ['nombre', 'cliente', 'estado', 'acciones'];
  isLoading: boolean = false; // ✅ Para mostrar spinner

  ngOnInit() {
    this.cargarProyectos();
  }

  /**
   * Cargar lista de proyectos desde el backend
   */
  cargarProyectos() {
    this.isLoading = true;
    // ✅ Actualizar URL sin /gestion/
    this.http.get<any[]>(`${environment.apiUrl}/proyectos`).subscribe({
      next: (data) => {
        this.proyectos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar proyectos', err);
        this.snackBar.open('Error al cargar proyectos', 'Cerrar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Abrir el diálogo para crear nuevo proyecto
   */
  abrirFormulario() {
    const dialogRef = this.dialog.open(ProjectForm, {
      width: '500px',
      disableClose: false
    });

    // Escuchar el resultado del diálogo
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === true) {
        this.snackBar.open('Proyecto creado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarProyectos(); // ✅ Recargar la lista
      }
    });
  }

  /**
   * Editar un proyecto existente
   */
  editarProyecto(proyecto: any) {
    const dialogRef = this.dialog.open(ProjectForm, {
      width: '500px',
      data: { proyecto }, // ✅ Pasar datos al formulario
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === true) {
        this.snackBar.open('Proyecto actualizado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarProyectos();
      }
    });
  }

  /**
   * Eliminar/Dar de baja un proyecto
   */
  eliminarProyecto(id: number) {
    if (confirm('¿Estás seguro de que deseas dar de baja este proyecto?')) {
      this.isLoading = true;
      // ✅ Actualizar URL sin /gestion/
      this.http.delete(`${environment.apiUrl}/proyectos/${id}`).subscribe({
        next: () => {
          this.snackBar.open('Proyecto eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.cargarProyectos();
        },
        error: (err) => {
          console.error('Error al eliminar proyecto', err);
          this.snackBar.open('Error al eliminar proyecto', 'Cerrar', { duration: 5000 });
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Ver detalle de un proyecto (abrir nueva vista)
   */
  verDetalle(id: number) {
    // ✅ Podrías navegar a una ruta de detalle
    // this.router.navigate(['/proyectos', id]);
    alert(`Ver detalle del proyecto ${id} - Implementar navegación`);
  }

  /**
   * Lógica de colores según el Script SQL del profesor
   */
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'ACTIVO': return 'primary';
      case 'FINALIZADO': return 'accent';
      case 'BAJA': return 'warn';
      default: return '';
    }
  }
}