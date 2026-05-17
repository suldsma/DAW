import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthStore } from './auth/auth-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura // Define el preset visual Aura como tema por defecto de PrimeNG
      }
    }),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          // Interceptor funcional para adjuntar el JWT en cada petición saliente hacia la API
          const authStore = inject(AuthStore);
          const token = authStore.obtenerToken();
          
          if (token) {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          return next(req);
        }
      ])
    )
  ]
};