// src/app/auth/auth.store.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  // Clave para almacenar el token de sesión
  private tokenKey = 'auth_token';

  // Guarda el token en el almacenamiento de la sesión actual
  guardarToken(token: string): void {
    try {
      sessionStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  }

  // Recupera el token guardado (devuelve null si no existe)
  obtenerToken(): string | null {
    try {
      return sessionStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  // Borra el token (se usa al cerrar sesión)
  eliminarToken(): void {
    try {
      sessionStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Error al eliminar token:', error);
    }
  }

  // Verifica rápido mediante conversión booleana si hay un token activo
  existeToken(): boolean {
    return !!this.obtenerToken();
  }
}