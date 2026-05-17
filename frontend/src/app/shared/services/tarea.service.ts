// src/app/shared/services/tarea.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Tarea,
  TareasKanban,
  CreateTareaRequest,
  UpdateTareaRequest,
  ApiResponse
} from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TareaService {

  constructor(private apiService: ApiService) {}

  // Obtener lista de tareas de un proyecto
  listarTareas(
    idProyecto: number,
    descripcion?: string,
    estado?: string
  ): Observable<Tarea[]> {
    const params: any = {};

    if (descripcion) params.descripcion = descripcion;
    if (estado) params.estado = estado;

    return this.apiService.get<Tarea[]>(
      `/proyectos/${idProyecto}/tareas`,
      params
    );
  }

  // Obtener tarea específica
  obtenerTarea(idProyecto: number, id: number): Observable<Tarea> {
    return this.apiService.get<Tarea>(
      `/proyectos/${idProyecto}/tareas/${id}`
    );
  }

  // Crear nueva tarea
  crearTarea(
    idProyecto: number,
    data: CreateTareaRequest
  ): Observable<Tarea> {
    return this.apiService.post<ApiResponse<Tarea>>(
      `/proyectos/${idProyecto}/tareas`,
      data
    ).pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Respuesta inválida del servidor');
      })
    );
  }

  // Actualizar tarea
  actualizarTarea(
    idProyecto: number,
    id: number,
    data: UpdateTareaRequest
  ): Observable<void> {
    return this.apiService.put<void>(
      `/proyectos/${idProyecto}/tareas/${id}`,
      data
    );
  }

  // Eliminar tarea
  eliminarTarea(idProyecto: number, id: number): Observable<void> {
    return this.apiService.delete<void>(
      `/proyectos/${idProyecto}/tareas/${id}`
    );
  }

  // Obtener tablero Kanban
  obtenerTableroKanban(idProyecto: number): Observable<TareasKanban> {
    return this.apiService.get<TareasKanban>(
      `/proyectos/${idProyecto}/tareas/kanban/tablero`
    );
  }
}