// src/app/shared/services/cliente.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Cliente,
  CreateClienteRequest,
  UpdateClienteRequest,
  ApiResponse
} from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private endpoint = '/clientes';

  constructor(private apiService: ApiService) {}

  // Obtener lista de clientes
  listarClientes(
    estado?: string,
    nombre?: string
  ): Observable<Cliente[]> {
    const params: any = {};
    
    if (estado) params.estado = estado;
    if (nombre) params.nombre = nombre;

    return this.apiService.get<Cliente[]>(this.endpoint, params);
  }

  // Obtener un cliente específico
  obtenerCliente(id: number): Observable<Cliente> {
    return this.apiService.get<Cliente>(`${this.endpoint}/${id}`);
  }

  // Crear nuevo cliente
  crearCliente(data: CreateClienteRequest): Observable<Cliente> {
    return this.apiService.post<ApiResponse<Cliente>>(this.endpoint, data).pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Respuesta inválida del servidor');
      })
    );
  }

  // Actualizar cliente
  actualizarCliente(
    id: number,
    data: UpdateClienteRequest
  ): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${id}`, data);
  }

  // Eliminar cliente
  eliminarCliente(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}