import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'expenses',
    loadComponent: () => import('./pages/expenses.component').then(m => m.ExpensesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'expenses/new',
    loadComponent: () => import('./pages/expense-form.component').then(m => m.ExpenseFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'expenses/edit/:id',
    loadComponent: () => import('./pages/expense-form.component').then(m => m.ExpenseFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'income',
    loadComponent: () => import('./pages/income-form.component').then(m => m.IncomeFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'goals',
    loadComponent: () => import('./pages/goal-form.component').then(m => m.GoalFormComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];
