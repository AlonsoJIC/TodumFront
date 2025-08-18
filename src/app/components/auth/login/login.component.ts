import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth/auth.service';
import { LoginRequest } from '../../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ]
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  rememberMe = false;
  hidePassword = true;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  onSubmit(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.showError('Por favor, completa todos los campos');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData, this.rememberMe).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        this.showSuccess(`¡Bienvenido, ${response.name}!`);
        this.router.navigate(['/boards']);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        let errorMessage = 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';

        if (error.status === 401) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        }

        this.showError(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
