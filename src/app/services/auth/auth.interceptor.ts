import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el token del AuthService
  const token = authService.getToken();

  // Si hay token, agregarlo al header Authorization
  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }) : req;

  // Procesar la request y manejar errores de autenticación
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401 Unauthorized, logout automático
      if (error.status === 401) {
        console.warn('🚨 Token expirado o inválido. Redirecting to login...');
        authService.logout();
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};
