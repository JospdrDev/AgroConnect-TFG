import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

/**
 * Interceptor funcional (Angular 17+).
 * Añade el header Authorization: Bearer <token> a todas las peticiones
 * que van a la API, y redirige al login si recibe 401.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Rutas públicas: no añadir token
  const publicRoutes = ['/api/register', '/api/login_check'];
  const isPublic = publicRoutes.some(route => req.url.includes(route));

  const token = authService.getToken();

  const authReq = (token && !isPublic)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublic) {
        localStorage.removeItem('jwt_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};