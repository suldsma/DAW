import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service'; 
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  formulario!: FormGroup;
  cargando = false;
  mostrarErrores = false;
  mensajeError = '';
  mostrarPassword = false;

  // Manejador para desubscribirse de los Observables al destruir el componente
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    // Si ya está logueado, lo redirijo directo a proyectos
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/proyectos']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Defino el formulario reactivo con sus validaciones básicas
  crearFormulario(): void {
    this.formulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      clave: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  iniciarSesion(): void {
    this.mostrarErrores = false;
    this.mensajeError = '';

    if (this.formulario.invalid) {
      this.mostrarErrores = true;
      return;
    }

    this.cargando = true;

    const credenciales = {
      nombre: this.formulario.get('nombre')?.value,
      clave: this.formulario.get('clave')?.value
    };

    this.authService.login(credenciales)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cargando = false;
          // Redirijo a la URL que intentaba entrar, o por defecto a proyectos
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/proyectos';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.cargando = false;
          this.mensajeError = error.message || 'Error en la autenticación';
          this.mostrarErrores = true;
        }
      });
  }

  // Alterna la visibilidad del texto de la contraseña
  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Getters para facilitar el acceso a los campos desde el HTML
  get nombre() {
    return this.formulario.get('nombre');
  }

  get clave() {
    return this.formulario.get('clave');
  }

  // Métodos rápidos para saber si tengo que pintar los inputs de rojo
  get nombreInvalido(): boolean {
    return (this.mostrarErrores && this.nombre?.invalid) || false;
  }

  get claveInvalida(): boolean {
    return (this.mostrarErrores && this.clave?.invalid) || false;
  }
}