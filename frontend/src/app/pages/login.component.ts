import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">💸</div>
          <span class="auth-logo-text">Spendly</span>
        </div>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to track your finances</p>

        @if (errorMsg) {
          <div class="alert alert-danger">⚠️ {{ errorMsg }}</div>
        }

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input
              class="form-control"
              [class.error]="loginForm.submitted && !username"
              type="text"
              placeholder="Enter your username"
              [(ngModel)]="username"
              name="username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              class="form-control"
              [class.error]="loginForm.submitted && !password"
              type="password"
              placeholder="Enter your password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full btn-lg"
            [disabled]="loading"
          >
            @if (loading) {
              <span class="btn-spinner"></span> Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account?
          <a routerLink="/register">Create one →</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading  = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading  = true;
    this.errorMsg = '';

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading  = false;
        const data    = err.error;
        if (data?.non_field_errors) {
          this.errorMsg = data.non_field_errors[0];
        } else {
          this.errorMsg = 'Login failed. Check your credentials.';
        }
      }
    });
  }
}
