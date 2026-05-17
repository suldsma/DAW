// src/app/shared/models/index.ts

// ============================================================================
// ENUMS
// ============================================================================

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  BAJA = 'BAJA'
}

export enum EstadoCliente {
  ACTIVO = 'ACTIVO',
  BAJA = 'BAJA'
}

export enum EstadoProyecto {
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
  BAJA = 'BAJA'
}

export enum EstadoTarea {
  PENDIENTE = 'PENDIENTE',
  FINALIZADA = 'FINALIZADA',
  BAJA = 'BAJA'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Usuario {
  id: number;
  nombre: string;
  estado: EstadoUsuario;
}

export interface Cliente {
  id: number;
  nombre: string;
  estado: EstadoCliente;
}

export interface Proyecto {
  id: number;
  nombre: string;
  estado: EstadoProyecto;
  cliente?: Cliente | null;
  idCliente?: number | null;
}

export interface Tarea {
  id: number;
  descripcion: string;
  estado: EstadoTarea;
}

export interface ProyectoConTareas extends Proyecto {
  tareas: Tarea[];
}

export interface TareasKanban {
  PENDIENTE: Tarea[];
  FINALIZADA: Tarea[];
}

// ============================================================================
// DTOs - REQUEST
// ============================================================================

export interface LoginRequest {
  nombre: string;
  clave: string;
}

export interface CreateClienteRequest {
  nombre: string;
}

export interface UpdateClienteRequest {
  nombre?: string;
  estado?: EstadoCliente;
}

export interface CreateProyectoRequest {
  nombre: string;
  idCliente?: number | null;
}

export interface UpdateProyectoRequest {
  nombre?: string;
  estado?: EstadoProyecto;
  idCliente?: number | null;
}

export interface CreateTareaRequest {
  descripcion: string;
}

export interface UpdateTareaRequest {
  descripcion?: string;
  estado?: EstadoTarea;
}

// ============================================================================
// DTOs - RESPONSE
// ============================================================================

export interface LoginResponse {
  accessToken: string;
}

export interface ApiResponse<T = any> {
  id?: number;
  data?: T;
  message?: string;
  error?: string;
}

export interface ResumenEstadisticas {
  resumen: {
    totalClientes: number;
    clientesActivos: number;
    proyectosActivos: number;
    proyectosFinalizados: number;
    tareasPendientes: number;
    tareasFinalizadas: number;
  };
  porcentajes: {
    proyectosFinalizados: number;
    tareasCompletadas: number;
  };
  fechaReporte: string;
}

export interface EstadisticasPorCliente {
  clienteId: number;
  clienteNombre: string;
  cantidadProyectos: number;
  proyectosActivos: number;
  cantidadTareas: number;
  tareasFinalizadas: number;
}

export interface EstadisticasPorProyecto {
  proyectoId: number;
  proyectoNombre: string;
  estado: EstadoProyecto;
  cliente: string;
  totalTareas: number;
  porcentajeCompletado: number;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}