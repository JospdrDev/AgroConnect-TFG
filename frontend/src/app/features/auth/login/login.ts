import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email    = '';
  password = '';

  showPassword = false;
  isLoading    = false;
  loginError   = false;
  showErrors   = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.showErrors = true;
    this.loginError = false;

    if (!this.email || !this.password) return;

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.loginError = true;
      }
    });
  }

  loginDemo(): void {
    this.email    = 'test@test.com';
    this.password = 'Test1234!';
    this.onSubmit();
  }
}