import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface RegistroAuditoria {
  id: number;
  tipoEntidad: string;
  idEntidad: number;
  tipoOperacion: string;
  idUsuario: number;
  nombreUsuario: string;
  datosCambio?: any;
  detalles?: string;
  fechaOperacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private endpoint = '/auditoria';

  constructor(private apiService: ApiService) {}

  obtenerHistorialGeneral(limite: number = 100): Observable<RegistroAuditoria[]> {
    return this.apiService.get<RegistroAuditoria[]>(
      `${this.endpoint}/historial`,
      { limite }
    );
  }

  obtenerHistorialEntidad(tipoEntidad: string, idEntidad: number): Observable<RegistroAuditoria[]> {
    return this.apiService.get<RegistroAuditoria[]>(
      `${this.endpoint}/entidad/${tipoEntidad}/${idEntidad}`
    );
  }

  obtenerHistorialUsuario(idUsuario: number): Observable<RegistroAuditoria[]> {
    return this.apiService.get<RegistroAuditoria[]>(
      `${this.endpoint}/usuario/${idUsuario}`
    );
  }
}