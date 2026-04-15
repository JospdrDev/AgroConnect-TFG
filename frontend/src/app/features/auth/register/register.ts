import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  // Campos del formulario
  nombre          = '';
  email           = '';
  password        = '';
  confirmPassword = '';

  // Estados UI
  showPassword        = false;
  showConfirmPassword = false;
  isLoading           = false;
  showErrors          = false;
  registerSuccess     = false;

  constructor(private router: Router) {}

  onSubmit(): void {
    this.showErrors = true;

    const formularioValido =
      this.nombre &&
      this.email &&
      this.password &&
      this.password.length >= 6 &&
      this.password === this.confirmPassword;

    if (!formularioValido) return;

    this.isLoading = true;

    // TODO: reemplazar este bloque por la llamada real a la API cuando esté disponible:
    // this.http.post('http://localhost:8000/api/register', {
    //   nombre: this.nombre,
    //   email: this.email,
    //   password: this.password
    // }).subscribe({
    //   next: () => this.router.navigate(['/login']),
    //   error: (err) => { this.isLoading = false; /* mostrar error */ }
    // });

    // Simulación mockup
    setTimeout(() => {
      this.isLoading      = false;
      this.registerSuccess = true;
      setTimeout(() => this.router.navigate(['/login']), 1500);
    }, 1000);
  }
}
