// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, Usuario, EstadoUsuario } from '../shared/models/index';
import { AuthStore } from './auth-store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';
  
  // Subjects para manejar el estado del usuario y la autenticación global
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  private autenticadoSubject = new BehaviorSubject<boolean>(false);
  public autenticado$ = this.autenticadoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authStore: AuthStore
  ) {
    // Chequeo si hay una sesión activa al levantar el servicio
    this.verificarAutenticacion();
  }

  // Lógica de inicio de sesión
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        this.authStore.guardarToken(response.accessToken);
        this.autenticadoSubject.next(true);
        this.extraerDatosDelToken(response.accessToken);
      }),
      catchError(error => {
        const mensaje = error.error?.message || 'Error en la autenticación';
        console.error('Error de login:', mensaje);
        return throwError(() => new Error(mensaje));
      })
    );
  }

  // Trae los datos del usuario logueado desde la API
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/auth/me`).pipe(
      tap(usuario => {
        this.usuarioSubject.next(usuario);
      }),
      catchError(error => {
        console.error('Error al obtener perfil:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Limpia los datos y cierra la sesión
  logout(): void {
    this.authStore.eliminarToken();
    this.usuarioSubject.next(null);
    this.autenticadoSubject.next(false);
  }

  // Validación rápida de token existente y válido
  estaAutenticado(): boolean {
    const token = this.authStore.obtenerToken();
    return !!token && !this.tokenExpirado(token);
  }

  obtenerToken(): string | null {
    return this.authStore.obtenerToken();
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  // Valida el token del almacenamiento local e intenta refrescar el perfil
  private verificarAutenticacion(): void {
    const token = this.authStore.obtenerToken();
    
    if (token && !this.tokenExpirado(token)) {
      this.autenticadoSubject.next(true);
      this.extraerDatosDelToken(token);
      
      this.obtenerPerfil().subscribe({
        next: (usuario) => {
          console.log('Usuario autenticado:', usuario);
        },
        error: (error) => {
          console.error('Error verificando autenticación:', error);
          this.logout();
        }
      });
    } else {
      this.logout();
    }
  }

  // Lee los datos básicos del usuario metidos en el JWT de forma provisoria
  private extraerDatosDelToken(token: string): void {
    try {
      const payload = this.decodeToken(token);
      if (payload) {
        const usuario: Usuario = {
          id: payload.sub || 0,
          nombre: payload.nombre || 'Usuario',
          estado: EstadoUsuario.ACTIVO
        };
        this.usuarioSubject.next(usuario);
      }
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }

  // Decodifica la sección central (payload) del token base64
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  }

  // Compara la fecha de expiración del token con la hora actual
  private tokenExpirado(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }
      const fechaExpiracion = new Date(payload.exp * 1000);
      return fechaExpiracion < new Date();
    } catch (error) {
      console.error('Error verificando expiración:', error);
      return true;
    }
  }
}