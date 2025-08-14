import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Por ahora, simularemos un usuario logueado
  private currentUserSubject = new BehaviorSubject<User>({
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  });

  currentUser$ = this.currentUserSubject.asObservable();

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Aquí posteriormente implementaremos el login real
  login(email: string, password: string): Observable<User> {
    // TODO: Implementar login real
    return this.currentUser$;
  }

  logout(): void {
    this.currentUserSubject.next(null as any);
  }
}
