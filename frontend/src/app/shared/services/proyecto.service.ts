import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Proyecto,
  ProyectoConTareas,
  CreateProyectoRequest,
  UpdateProyectoRequest,
  ApiResponse
} from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  // El endpoint relativo que se unirá a la URL base en el ApiService
  private endpoint = '/proyectos';

  constructor(private apiService: ApiService) {}

  /**
   * Obtener lista de proyectos filtrados
   */
  listarProyectos(nombre?: string, estado?: string): Observable<Proyecto[]> {
    const params: any = {};
    if (nombre) params.nombre = nombre;
    if (estado) params.estado = estado;

    return this.apiService.get<Proyecto[]>(this.endpoint, params);
  }

  /**
   * Obtener proyecto con detalle de tareas (Vista Kanban)
   */
  obtenerProyecto(id: number): Observable<ProyectoConTareas> {
    return this.apiService.get<ProyectoConTareas>(`${this.endpoint}/${id}`);
  }

  /**
   * Crear nuevo proyecto procesando la respuesta tipada del backend
   */
  crearProyecto(data: CreateProyectoRequest): Observable<Proyecto> {
    return this.apiService.post<ApiResponse<Proyecto>>(this.endpoint, data).pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Respuesta inválida del servidor');
      })
    );
  }

  /**
   * Actualizar los datos o el estado de un proyecto
   */
  actualizarProyecto(id: number, data: UpdateProyectoRequest): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Eliminar proyecto de forma lógica
   */
  eliminarProyecto(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Exportar proyectos a un archivo binario CSV
   */
  exportarCSV(): Observable<Blob> {
    return this.apiService.getBlob(`${this.endpoint}/exportar/csv`);
  }
}