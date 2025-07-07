import { Routes } from '@angular/router';
import { ResetPasswordComponent } from './Componets/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () => import('./Pages/register-page/register-page.component').then(m => m.RegisterPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./Pages/login-page/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./Pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
  },
  
  {
    path: 'create-order',
    loadComponent: () => import('./Pages/create-order-page/create-order-page.component').then(m => m.CreateOrderPageComponent)
  },
  {
    path: 'order-history',
    loadComponent: () => import('./Pages/order-history-page/order-history-page.component').then(m => m.OrderHistoryPageComponent)
  },
  {
    path: 'frequent-customers',
    loadComponent: () => import('./Pages/frequent-customers-page/frequent-customers-page.component').then(m => m.FrequentCustomersPageComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./Pages/settings-page/settings-page.component').then(m => m.SettingsPageComponent)
  },
  {
    path: 'reset-details',
    loadComponent: () => import('./Pages/reset-password-page/reset-password-page.component').then(m => m.ResetPasswordPageComponent)
  },
  { path:'reset-password/:token', component: ResetPasswordComponent},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
