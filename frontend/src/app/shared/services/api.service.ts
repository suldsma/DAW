import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { ErrorResponse } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // ✅ Apuntamos con éxito al dominio y puerto real de tu Backend Node.js
  private apiUrl = 'http://localhost:3000/api/v1';
  private timeoutMs = 30000;
  private retryCount = 1;

  constructor(private http: HttpClient) {}

  // =========================================================================
  // GET REQUESTS
  // =========================================================================
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<T>(url, { params: httpParams }).pipe(
      timeout(this.timeoutMs),
      retry(this.retryCount),
      catchError(this.handleError)
    );
  }

  // =========================================================================
  // POST REQUESTS
  // =========================================================================
  post<T>(endpoint: string, data: any = {}): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.post<T>(url, data).pipe(
      timeout(this.timeoutMs),
      catchError(this.handleError)
    );
  }

  // =========================================================================
  // PUT REQUESTS
  // =========================================================================
  put<T>(endpoint: string, data: any = {}): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.put<T>(url, data).pipe(
      timeout(this.timeoutMs),
      catchError(this.handleError)
    );
  }

  // =========================================================================
  // DELETE REQUESTS
  // =========================================================================
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.delete<T>(url).pipe(
      timeout(this.timeoutMs),
      catchError(this.handleError)
    );
  }

  // =========================================================================
  // BLOB REQUESTS (para descargas)
  // =========================================================================
  getBlob(endpoint: string): Observable<Blob> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      timeout(this.timeoutMs),
      catchError(this.handleError)
    );
  }

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    let statusCode = error.status;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'No hay conexión con el servidor';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Solicitud inválida';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor inicia sesión nuevamente';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para esta acción';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Conflicto con los datos existentes';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor. Intenta más tarde';
      } else if (error.status === error.status) {
        errorMessage = error.error?.message || 'Error en la solicitud';
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: statusCode,
      message: errorMessage,
      error: error.error?.error
    };

    console.error('API Error:', errorResponse);
    return throwError(() => errorResponse);
  }
}