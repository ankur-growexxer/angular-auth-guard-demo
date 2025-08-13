import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { SignInComponent } from './pages/sign-in/sign-in';
import { SignUpComponent } from './pages/sign-up/sign-up';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AboutComponent } from './pages/about/about';
import { AuthGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'about', component: AboutComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'logout',
    loadComponent: () => {
      const router = inject(Router);
      localStorage.removeItem('auth_token');
      router.navigate(['/sign-in']);
      return import('./pages/sign-in/sign-in').then(m => m.SignInComponent);
    }
  }
];