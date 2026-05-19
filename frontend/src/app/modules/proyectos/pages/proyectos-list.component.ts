// src/app/modules/proyectos/pages/proyectos-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProyectoService } from '../../../shared/services/proyecto.service';
import { ClienteService } from '../../../shared/services/cliente.service';
import { Proyecto, Cliente, EstadoProyecto } from '../../../shared/models/index';
import { ProyectoFormComponent } from '../components/proyecto-form.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Interfaz mapeada para evitar usar métodos directos en las directivas del HTML
interface ProyectoRender extends Proyecto {
  clienteNombre: string;
  estadoTexto: string;
  estadoColor: string;
}

@Component({
  selector: 'app-proyectos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProyectoFormComponent],
  templateUrl: './proyectos-list.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosListComponent implements OnInit, OnDestroy {
  proyectos: Proyecto[] = [];
  proyectosFiltrados: ProyectoRender[] = [];
  clientes: Cliente[] = [];
  
  cargando = false;
  mostrarFormulario = false;
  proyectoEditando: Proyecto | null = null;

  filtroNombre = '';
  filtroEstado = '';

  estadoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: EstadoProyecto.ACTIVO },
    { label: 'Finalizado', value: EstadoProyecto.FINALIZADO },
    { label: 'Baja', value: EstadoProyecto.BAJA }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private proyectoService: ProyectoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarClientes(): void {
    this.clienteService.listarClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clientes = data;
          this.cargarProyectos();
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
          this.cargarProyectos();
        }
      });
  }

  cargarProyectos(): void {
    this.cargando = true;
    
    this.proyectoService.listarProyectos(
      this.filtroNombre || undefined,
      this.filtroEstado || undefined
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.proyectos = data;
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar proyectos:', error);
          this.cargando = false;
          this.proyectosFiltrados = [];
        }
      });
  }

  // Ejecuta las queries locales y pre-calcula los tags para evitar bucles en el ciclo de detección
  aplicarFiltros(): void {
    let filtrado = this.proyectos;

    if (this.filtroNombre) {
      filtrado = filtrado.filter(p =>
        p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
      );
    }

    if (this.filtroEstado) {
      filtrado = filtrado.filter(p => p.estado === this.filtroEstado);
    }

    this.proyectosFiltrados = filtrado.map(proyecto => ({
      ...proyecto,
      clienteNombre: this.calcularNombreCliente(proyecto.idCliente),
      estadoTexto: this.calcularTextoEstado(proyecto.estado),
      estadoColor: this.calcularColorEstado(proyecto.estado)
    }));
  }

  private calcularNombreCliente(idCliente?: number | null): string {
    if (!idCliente) {
      return 'Sin cliente (Proyecto Interno)';
    }
    const cliente = this.clientes.find(c => c.id === idCliente);
    return cliente?.nombre || 'Cliente desconocido';
  }

  private calcularTextoEstado(estado: string): string {
    switch (estado) {
      case EstadoProyecto.ACTIVO: return 'Activo';
      case EstadoProyecto.FINALIZADO: return 'Finalizado';
      case EstadoProyecto.BAJA: return 'Baja';
      default: return estado;
    }
  }

  private calcularColorEstado(estado: string): string {
    switch (estado) {
      case EstadoProyecto.ACTIVO: return '#10b981';
      case EstadoProyecto.FINALIZADO: return '#3b82f6';
      case EstadoProyecto.BAJA: return '#ef4444';
      default: return '#666';
    }
  }

  abrirFormulario(): void {
    this.proyectoEditando = null;
    this.mostrarFormulario = true;
  }

  editarProyecto(proyecto: Proyecto): void {
    this.proyectoEditando = proyecto;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.proyectoEditando = null;
  }

  onFormularioGuardado(): void {
    this.cerrarFormulario();
    this.cargarProyectos();
  }

  eliminarProyecto(proyecto: Proyecto): void {
    if (confirm(`¿Estás seguro que deseas eliminar el proyecto "${proyecto.nombre}"?`)) {
      this.proyectoService.eliminarProyecto(proyecto.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.cargarProyectos(),
          error: (error) => {
            console.error('Error al eliminar proyecto:', error);
            alert('Error al eliminar el proyecto');
          }
        });
    }
  }

  exportarCSV(): void {
    this.proyectoService.exportarCSV()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `proyectos_${new Date().getTime()}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error al exportar:', error);
          alert('Error al exportar los proyectos');
        }
      });
  }

  // Modifica secuencialmente el estado actual del proyecto (Cíclico)
  cambiarEstado(proyecto: Proyecto): void {
    let nuevoEstado: EstadoProyecto;

    switch (proyecto.estado) {
      case EstadoProyecto.ACTIVO:
        nuevoEstado = EstadoProyecto.FINALIZADO;
        break;
      case EstadoProyecto.FINALIZADO:
        nuevoEstado = EstadoProyecto.BAJA;
        break;
      default:
        nuevoEstado = EstadoProyecto.ACTIVO;
    }

    this.proyectoService.actualizarProyecto(proyecto.id, { estado: nuevoEstado })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.cargarProyectos(),
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          alert('Error al cambiar el estado del proyecto');
        }
      });
  }
}