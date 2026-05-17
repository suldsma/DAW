// src/app/modules/clientes/pages/clientes-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../shared/services/cliente.service';
import { Cliente, EstadoCliente } from '../../../shared/models/index';
import { ClienteFormComponent } from '../components/cliente-form.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteFormComponent],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css'
})
export class ClientesListComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  cargando = false;
  mostrarFormulario = false;
  clienteEditando: Cliente | null = null;

  // Propiedades vinculadas a los inputs de búsqueda en el HTML
  filtroNombre = '';
  filtroEstado = '';

  private destroy$ = new Subject<void>();

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Trae los clientes consumiendo el servicio de la API
  cargarClientes(): void {
    this.cargando = true;
    this.clienteService.listarClientes(this.filtroEstado || undefined, this.filtroNombre || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clientes = data;
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
          this.cargando = false;
        }
      });
  }

  // Realiza el filtrado en memoria sobre el array de clientes
  aplicarFiltros(): void {
    let filtrado = this.clientes;

    if (this.filtroNombre) {
      filtrado = filtrado.filter(c =>
        c.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
      );
    }

    if (this.filtroEstado) {
      filtrado = filtrado.filter(c => c.estado === this.filtroEstado);
    }

    this.clientesFiltrados = filtrado;
  }

  // Controladores para el manejo del modal del formulario
  abrirFormulario(): void {
    this.clienteEditando = null;
    this.mostrarFormulario = true;
  }

  editarCliente(cliente: Cliente): void {
    this.clienteEditando = cliente;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.clienteEditando = null;
  }

  // Recarga la lista completa cuando el formulario hijo emite que guardó con éxito
  onFormularioGuardado(): void {
    this.cerrarFormulario();
    this.cargarClientes();
  }

  eliminarCliente(cliente: Cliente): void {
    if (confirm(`¿Estás seguro que deseas eliminar el cliente "${cliente.nombre}"?`)) {
      this.clienteService.eliminarCliente(cliente.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cargarClientes();
          },
          error: (error) => {
            console.error('Error al eliminar cliente:', error);
          }
        });
    }
  }

  // Cambia rápido el estado (si está ACTIVO pasa a BAJA y viceversa)
  cambiarEstado(cliente: Cliente): void {
    const nuevoEstado = cliente.estado === EstadoCliente.ACTIVO
      ? EstadoCliente.BAJA
      : EstadoCliente.ACTIVO;

    this.clienteService.actualizarCliente(cliente.id, { estado: nuevoEstado })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cargarClientes();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
        }
      });
  }

  // Opciones para mapear el select del filtro en la vista
  get estadoOptions() {
    return [
      { label: 'Todos', value: '' },
      { label: 'Activo', value: EstadoCliente.ACTIVO },
      { label: 'Baja', value: EstadoCliente.BAJA }
    ];
  }

  // Helpers estéticos llamados desde el HTML para pintar los Badges
  obtenerColorEstado(estado: string): string {
    return estado === EstadoCliente.ACTIVO ? '#10b981' : '#ef4444';
  }

  obtenerTextoEstado(estado: string): string {
    return estado === EstadoCliente.ACTIVO ? 'Activo' : 'Baja';
  }
}