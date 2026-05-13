import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; // ✅ IMPORTAR

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./features/projects/project-list/project-list').then(m => m.ProjectList),
    canActivate: [AuthGuard] // ✅ PROTEGER RUTA CON AUTHGUARD
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];