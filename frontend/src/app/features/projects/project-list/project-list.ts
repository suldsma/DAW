import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// Importaciones de Material necesarias
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <--- Vital para el botón "Nuevo"

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
    MatDialogModule // <--- Importante incluirlo aquí
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog); // Inyectamos el servicio de diálogos
  
  proyectos: any[] = [];
  displayedColumns: string[] = ['nombre', 'cliente', 'estado', 'acciones'];

  ngOnInit() {
    this.cargarProyectos();
  }

  cargarProyectos() {
    this.http.get<any[]>(`${environment.apiUrl}/gestion/proyectos`).subscribe({
      next: (data) => {
        this.proyectos = data;
      },
      error: (err) => console.error('Error al cargar proyectos', err)
    });
  }

  // Esta función es la que debe llamar el botón (click) del HTML
  abrirFormulario() {
    console.log('Abriendo formulario de nuevo proyecto...');
    // Aquí podrías abrir un componente de diálogo o navegar
    // Ejemplo: this.router.navigate(['/proyectos/nuevo']);
    alert('Función para nuevo proyecto activada. ¡Listo para conectar el formulario!');
  }

  // Lógica de colores según el Script SQL del profesor
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'ACTIVO': return 'primary';
      case 'FINALIZADO': return 'accent';
      case 'BAJA': return 'warn';
      default: return '';
    }
  }
}