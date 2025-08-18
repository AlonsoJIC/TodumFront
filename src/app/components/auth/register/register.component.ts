import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth/auth.service';
import { RegisterRequest } from '../../../models';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };

  confirmPassword = '';
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        this.showSuccess(`¡Bienvenido, ${response.name}! Tu cuenta ha sido creada exitosamente.`);
        this.router.navigate(['/boards']);
      },
      error: (error) => {
        console.error('❌ Error en registro:', error);
        console.error('📋 Detalles completos del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          errorBody: error.error,
          headers: error.headers?.keys()
        });

        let errorMessage = 'Error al crear la cuenta. Por favor, inténtalo de nuevo.';

        if (error.status === 409) {
          errorMessage = 'Este email ya está registrado. Intenta con otro email.';
        } else if (error.status === 400) {
          // Intentar obtener el mensaje específico del backend
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else {
            errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.';
          }
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        }

        this.showError(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.registerData.name.trim()) {
      this.showError('El nombre es requerido');
      return false;
    }

    if (!this.registerData.email.trim()) {
      this.showError('El email es requerido');
      return false;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      this.showError('Por favor ingresa un email válido');
      return false;
    }

    if (this.registerData.password.length < 6) {
      this.showError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.showError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  get passwordsMatch(): boolean {
    return this.registerData.password === this.confirmPassword;
  }

  get isPasswordValid(): boolean {
    return this.registerData.password.length >= 6;
  }
}
