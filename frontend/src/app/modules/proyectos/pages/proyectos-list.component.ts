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

interface ProyectoRender extends Proyecto {
  clienteNombre: string;
  estadoTexto: string;
  estadoColor: string;
  diasRestantes: number;    
  colorFecha: string;       
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
        error: () => this.cargarProyectos()
      });
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.proyectoService.listarProyectos(this.filtroNombre || undefined, this.filtroEstado || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.proyectos = data;
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: () => { this.cargando = false; this.proyectosFiltrados = []; }
      });
  }

  aplicarFiltros(): void {
    let filtrado = this.proyectos;

    if (this.filtroNombre) {
      filtrado = filtrado.filter(p => p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()));
    }
    if (this.filtroEstado) {
      filtrado = filtrado.filter(p => p.estado === this.filtroEstado);
    }

    this.proyectosFiltrados = filtrado.map(proyecto => {
      const dias = this.calcularDiasRestantes(proyecto.fechaFinalizacionObjetivo);
      return {
        ...proyecto,
        clienteNombre: this.calcularNombreCliente(proyecto.idCliente),
        estadoTexto: this.calcularTextoEstado(proyecto.estado),
        estadoColor: this.calcularColorEstado(proyecto.estado),
        diasRestantes: dias,
        colorFecha: this.obtenerColorFecha(dias)
      };
    });
  }

  calcularDiasRestantes(fechaObjetivo?: Date | string | null): number {
    if (!fechaObjetivo) return 0;
    const fecha = new Date(fechaObjetivo);
    const hoy = new Date();
    fecha.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
  }

  obtenerColorFecha(dias: number): string {
    if (dias < 0) return '#ef4444'; 
    if (dias < 7) return '#ff9800'; 
    return '#10b981';
  }

  private calcularNombreCliente(idCliente?: number | null): string {
    return this.clientes.find(c => c.id === idCliente)?.nombre || 'Sin cliente';
  }

  private calcularTextoEstado(estado: string): string {
    return estado === EstadoProyecto.ACTIVO ? 'Activo' : estado === EstadoProyecto.FINALIZADO ? 'Finalizado' : 'Baja';
  }

  private calcularColorEstado(estado: string): string {
    return estado === EstadoProyecto.ACTIVO ? '#10b981' : estado === EstadoProyecto.FINALIZADO ? '#3b82f6' : '#ef4444';
  }

  exportarCSV(): void {
    console.warn('Función exportarCSV no implementada');
  }

  cambiarEstado(proyecto: Proyecto): void {
    console.log('Cambiando estado de:', proyecto.nombre);
  
  }

  abrirFormulario(): void { this.proyectoEditando = null; this.mostrarFormulario = true; }
  editarProyecto(proyecto: Proyecto): void { this.proyectoEditando = proyecto; this.mostrarFormulario = true; }
  cerrarFormulario(): void { this.mostrarFormulario = false; }
  onFormularioGuardado(): void { this.cerrarFormulario(); this.cargarProyectos(); }

  eliminarProyecto(proyecto: Proyecto): void {
    if (confirm(`¿Eliminar ${proyecto.nombre}?`)) {
      this.proyectoService.eliminarProyecto(proyecto.id).pipe(takeUntil(this.destroy$)).subscribe(() => this.cargarProyectos());
    }
  }
}