// src/app/auth/auth.guard.ts

import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Protege las rutas privadas: si no está logueado, va al login
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.estaAutenticado()) {
      return true;
    }

    // Guardo la URL a la que quería entrar para redirigirlo automáticamente después de loguearse
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Protege las rutas públicas (como el Login): si ya está logueado, lo manda directo al panel
  canActivate(): boolean {
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/proyectos']);
      return false;
    }
    return true;
  }
}