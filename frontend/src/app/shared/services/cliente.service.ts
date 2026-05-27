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

  listarClientes(
    estado?: string,
    nombre?: string
  ): Observable<Cliente[]> {
    const params: any = {};
    
    if (estado) params.estado = estado;
    if (nombre) params.nombre = nombre;

    return this.apiService.get<Cliente[]>(this.endpoint, params);
  }

  obtenerCliente(id: number): Observable<Cliente> {
    return this.apiService.get<Cliente>(`${this.endpoint}/${id}`);
  }

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

  actualizarCliente(
    id: number,
    data: UpdateClienteRequest
  ): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${id}`, data);
  }

  eliminarCliente(id: number, usuario?: any): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  contarClientesTotales(): Observable<number> {
    return this.apiService.get<{ total: number }>(`${this.endpoint}/count`).pipe(
      map(res => res.total)
    );
  }

  contarClientesActivos(): Observable<number> {
    return this.apiService.get<{ total: number }>(`${this.endpoint}/count`, { estado: 'ACTIVO' }).pipe(
      map(res => res.total)
    );
  }
}