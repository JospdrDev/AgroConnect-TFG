import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangeEmailRequest {
  password: string;
  new_email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient, private router: Router) {}

  // POST /api/login_check  → { token }
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/login_check`, {
        username: email, // Symfony json_login usa 'username'
        password,
      })
      .pipe(
        tap((res) => this.saveToken(res.token)),
        catchError((err) => throwError(() => err))
      );
  }

  // POST /api/register
  register(data: RegisterRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/api/register`, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // POST /api/logout  (requiere JWT)
  logout(): void {
    this.http
      .post(`${environment.apiUrl}/api/logout`, {})
      .pipe(catchError(() => throwError(() => null)))
      .subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession(), // limpiar siempre aunque falle
      });
  }

  // POST /api/change-password
  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${environment.apiUrl}/api/change-password`,
        data
      )
      .pipe(catchError((err) => throwError(() => err)));
  }

  // POST /api/change-email
  changeEmail(data: ChangeEmailRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/api/change-email`, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Helpers de sesión ──────────────────────────────────────────

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}