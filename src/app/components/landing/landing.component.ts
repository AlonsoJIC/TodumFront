import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class LandingComponent {
  features = [
    {
      icon: 'dashboard',
      title: 'Boards Organizados',
      description: 'Organiza todos tus proyectos en boards visuales y fáciles de gestionar.'
    },
    {
      icon: 'task_alt',
      title: 'Gestión de Tareas',
      description: 'Crea, edita y completa tareas con un sistema intuitivo de drag & drop.'
    },
    {
      icon: 'group_work',
      title: 'Colaboración',
      description: 'Trabaja en equipo y mantén a todos sincronizados en tiempo real.'
    },
    {
      icon: 'insights',
      title: 'Progreso Visual',
      description: 'Visualiza el progreso de tus proyectos de manera clara y efectiva.'
    }
  ];
}
