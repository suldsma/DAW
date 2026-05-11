import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    // AGREGÁ ESTA RUTA: Es a donde querés ir después del login
    path: 'proyectos', 
    loadComponent: () => import('./features/projects/project-list/project-list').then(m => m.ProjectList)
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