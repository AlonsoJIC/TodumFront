import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError, throwError } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private rememberMeKey = 'todum_remember_me';
  private tokenKey = 'todum_token';
  private userKey = 'todum_user';

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Verificar si hay un usuario guardado en localStorage/sessionStorage
  private loadUserFromStorage(): void {
    const rememberMe = localStorage.getItem(this.rememberMeKey) === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;

    const token = storage.getItem(this.tokenKey);
    const userStr = storage.getItem(this.userKey);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        console.log('🔑 Usuario cargado desde storage:', user);
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        this.clearStorage();
      }
    }
  }

  // Login con email y password
  login(loginData: LoginRequest, rememberMe: boolean = false): Observable<AuthResponse> {
    console.log('🔐 Intentando login:', { email: loginData.email, rememberMe });

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData).pipe(
      tap(response => {
        console.log('✅ Login exitoso:', response);
        // Convertir la respuesta plana del backend a User object
        const user: User = {
          id: response.id,
          name: response.name,
          email: response.email
        };
        this.setUserSession(user, response.token, rememberMe);
      })
    );
  }

  // Registro de nuevo usuario
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    console.log('📝 Registrando usuario:', {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password ? '***' : 'undefined',
      completePayload: registerData
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData).pipe(
      tap(response => {
        console.log('✅ Registro exitoso:', response);
        // Convertir la respuesta plana del backend a User object
        const user: User = {
          id: response.id,
          name: response.name,
          email: response.email
        };
        // Auto-login después del registro
        this.setUserSession(user, response.token, false);
      }),
      catchError(error => {
        console.error('❌ Error detallado en AuthService.register:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          errorBody: error.error,
          headers: error.headers
        });
        return throwError(() => error);
      })
    );
  }

  // Establecer sesión del usuario
  private setUserSession(user: User, token: string, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Guardar token y usuario
    storage.setItem(this.tokenKey, token);
    storage.setItem(this.userKey, JSON.stringify(user));
    localStorage.setItem(this.rememberMeKey, rememberMe.toString());

    // Actualizar estado actual
    this.currentUserSubject.next(user);

    console.log('💾 Sesión guardada:', { user: user.name, rememberMe, storage: rememberMe ? 'localStorage' : 'sessionStorage' });
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Obtener token actual
  getToken(): string | null {
    const rememberMe = localStorage.getItem(this.rememberMeKey) === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    return storage.getItem(this.tokenKey);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null;
  }

  // Logout
  logout(): void {
    console.log('🚪 Cerrando sesión');
    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  // Limpiar todo el storage
  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.rememberMeKey);

    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  // Verificar token válido (opcional - para verificar con backend)
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    // Podrías hacer una llamada al backend para validar el token
    // return this.http.get<{valid: boolean}>(`${this.apiUrl}/validate`).pipe(
    //   map(response => response.valid),
    //   catchError(() => of(false))
    // );

    // Por ahora, asumimos que si existe es válido
    return of(true);
  }
}
