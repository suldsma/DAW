import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { ClientesListComponent } from './modules/clientes/pages/clientes-list.component';
import { ProyectosListComponent } from './modules/proyectos/pages/proyectos-list.component';
import { ProyectoDetailComponent } from './modules/proyectos/pages/proyecto-detail.component';
import { EstadisticasComponent } from './modules/estadisticas/pages/estadisticas.component';
import { KanbanBoardComponent } from './modules/proyectos/components/kanban-board.component';
import { AuditoriaComponent } from './modules/auditoria/auditoria.component';

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
      {
        path: '',
        redirectTo: '/proyectos',
        pathMatch: 'full'
      },
      {
        path: 'clientes',
        component: ClientesListComponent
      },
      {
        path: 'proyectos',
        component: ProyectosListComponent
      },
      {
        path: 'proyectos/:id',
        component: ProyectoDetailComponent
      },
      {
        path: 'estadisticas',
        component: EstadisticasComponent
      },
      {
        path: 'tareas',
        component: KanbanBoardComponent
      },
      
      {
        path: 'auditoria',
        component: AuditoriaComponent
      }
    ]
  },

  // ===== RUTA CATCH-ALL =====
  {
    path: '**',
    redirectTo: '/proyectos'
  }
];