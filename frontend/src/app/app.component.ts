import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [MessageService] 
})
export class AppComponent {
  // Título de la aplicación utilizando la API de Signals para reactividad fluida
  title = signal('Gestión de Proyectos'); 
}