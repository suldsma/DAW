// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { ClientesListComponent } from './modules/clientes/pages/clientes-list.component';
import { ProyectosListComponent } from './modules/proyectos/pages/proyectos-list.component';
import { ProyectoDetailComponent } from './modules/proyectos/pages/proyecto-detail.component';
import { EstadisticasComponent } from './modules/estadisticas/pages/estadisticas.component';

export const routes: Routes = [
  // ===== RUTA DE LOGIN =====
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard] 
  },

  // ===== RUTAS PROTEGIDAS CON LAYOUT =====
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], 
    children: [
      // Ruta por defecto
      {
        path: '',
        redirectTo: '/proyectos',
        pathMatch: 'full'
      },

      // ===== CLIENTES =====
      {
        path: 'clientes',
        component: ClientesListComponent
      },

      // ===== PROYECTOS =====
      {
        path: 'proyectos',
        component: ProyectosListComponent
      },

      // ===== DETALLE DE PROYECTO (CON ID) =====
      {
        path: 'proyectos/:id',
        component: ProyectoDetailComponent
      },

      // ===== ESTADÍSTICAS =====
      {
        path: 'estadisticas',
        component: EstadisticasComponent
      }
    ]
  },

  // ===== RUTA CATCH-ALL (CUALQUIER OTRA URL) =====
  {
    path: '**',
    redirectTo: '/proyectos'
  }
];