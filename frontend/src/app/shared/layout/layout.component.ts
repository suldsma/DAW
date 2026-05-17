// src/app/shared/layout/layout.component.ts

import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Usuario } from '../models/index';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

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

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.authService.usuario$
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuario => {
        this.usuario = usuario;
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.menuAbierto = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); 
    }
    this.menuAbierto = !this.menuAbierto;
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSesion(): void {
    this.menuAbierto = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickAfuera(event: MouseEvent): void {
    if (this.menuAbierto && !this.elementRef.nativeElement.contains(event.target)) {
      this.menuAbierto = false;
    }
  }

  get nombreUsuario(): string {
    return this.usuario?.nombre || 'Usuario';
  }

  get inicialUsuario(): string {
    const nombre = this.usuario?.nombre || 'U';
    return nombre.charAt(0).toUpperCase();
  }
}