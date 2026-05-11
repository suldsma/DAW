import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'; 
import { MaterialModule } from '../../../shared/material.module';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MaterialModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variable para mostrar/ocultar la contraseña en el mat-icon-button
  hide = true;
  
  // Definición del formulario con validaciones obligatorias
  loginForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]], // Coincide con la columna 'nombre' del SQL
    clave: ['', [Validators.required]]   // Coincide con la columna 'clave' del SQL
  });

  onSubmit() {
    if (this.loginForm.valid) {
      // Obtenemos los valores de forma segura
      const credentials = {
        nombre: this.loginForm.get('nombre')?.value,
        clave: this.loginForm.get('clave')?.value
      };

      this.authService.login(credentials).subscribe({
        next: (res) => {
          console.log('Login exitoso:', res);
          // Redirección a la gestión de proyectos según requerimientos
          this.router.navigate(['/proyectos']); 
        },
        error: (err) => {
          console.error('Error en el login:', err);
          // Mensaje de error si fallan las credenciales o la conexión
          alert('Error: Usuario o clave incorrectos. Verificá que el backend esté encendido.');
        }
      });
    } else {
      // Marcamos los campos como tocados para que se vean los errores en rojo si está vacío
      this.loginForm.markAllAsTouched();
    }
  }
}