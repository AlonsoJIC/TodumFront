import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth/auth.service';
import { User } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class AppComponent implements OnInit {
  title = 'Todum';
  currentUser: User | null = null;
  showNavbar = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.showNavbar = !!user; // Mostrar navbar solo si hay usuario logueado
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToBoards(): void {
    this.router.navigate(['/boards']);
  }
}
