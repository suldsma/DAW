// src/app/shared/layout/layout.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Usuario } from '../models/index';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  menuAbierto = false;
  sidebarAbierto = true;

  // Subject para desuscribirse automáticamente
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Se suscribe CON takeUntil para desuscribirse automáticamente
    this.authService.usuario$
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuario => {
        this.usuario = usuario;
      });
  }

  // IMPORTANTE: Desuscribirse cuando el componente se destruye
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get nombreUsuario(): string {
    return this.usuario?.nombre || 'Usuario';
  }

  get inicialUsuario(): string {
    const nombre = this.usuario?.nombre || 'U';
    return nombre.charAt(0).toUpperCase();
  }
}