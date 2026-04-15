import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  // Campos del formulario
  email    = '';
  password = '';

  // Estados UI
  showPassword = false;
  isLoading    = false;
  loginError   = false;
  showErrors   = false;

  // Modo mockup: siempre activo hasta que la API esté lista
  mockupMode = true;

  constructor(private router: Router) {}

  onSubmit(): void {
    this.showErrors = true;
    this.loginError = false;

    if (!this.email || !this.password) return;

    this.isLoading = true;

    // TODO: reemplazar este bloque por la llamada real a la API cuando esté disponible:
    // this.http.post('http://localhost:8000/api/login', { email: this.email, password: this.password })
    //   .subscribe({ next: (res) => this.router.navigate(['/dashboard']), error: () => { this.loginError = true; } });

    // Simulación de respuesta (mockup)
    setTimeout(() => {
      this.isLoading = false;
      // En el mockup cualquier credencial válida accede al dashboard
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  loginDemo(): void {
    this.email    = 'demo@agroconnect.es';
    this.password = 'demo1234';
    this.onSubmit();
  }
}