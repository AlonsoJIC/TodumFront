import { Routes } from '@angular/router';
import { BoardListComponent } from './components/board-list/board-list.component';
import { BoardDetailComponent } from './components/board-detail/board-detail.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard, GuestGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  // Landing page for non-authenticated users
  {
    path: '',
    component: LandingComponent,
    canActivate: [GuestGuard]
  },

  // Auth routes (only for non-authenticated users)
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Protected routes (only for authenticated users)
  {
    path: 'boards',
    component: BoardListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'boards/:id',
    component: BoardDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cards/:id',
    component: TaskListComponent,
    canActivate: [AuthGuard]
  },

  // Wildcard route - redirect to home
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
