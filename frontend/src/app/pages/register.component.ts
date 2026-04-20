import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">💸</div>
          <span class="auth-logo-text">Spendly</span>
        </div>

        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Start your financial journey today</p>

        @if (errorMsg) {
          <div class="alert alert-danger">⚠️ {{ errorMsg }}</div>
        }
        @if (successMsg) {
          <div class="alert alert-success">✅ {{ successMsg }}</div>
        }

        <form (ngSubmit)="onSubmit()" #regForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input class="form-control" type="text" placeholder="John"
                [(ngModel)]="form.first_name" name="first_name" />
            </div>
            <div class="form-group">
              <label class="form-label">Username <span class="req">*</span></label>
              <input class="form-control" type="text" placeholder="johndoe"
                [(ngModel)]="form.username" name="username" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email <span class="req">*</span></label>
            <input class="form-control" type="email" placeholder="john@example.com"
              [(ngModel)]="form.email" name="email" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password <span class="req">*</span></label>
            <input class="form-control" type="password" placeholder="Min. 6 characters"
              [(ngModel)]="form.password" name="password" required minlength="6" />
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading">
            @if (loading) {
              <span class="btn-spinner"></span> Creating account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in →</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .req { color: var(--danger); }
    .btn-spinner {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
      border-radius: 50%; animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  form = { username: '', email: '', password: '', first_name: '' };
  loading    = false;
  errorMsg   = '';
  successMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.form.username || !this.form.email || !this.form.password) return;
    this.loading  = true;
    this.errorMsg = '';

    this.auth.register(this.form).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'Account created! Redirecting…';
        setTimeout(() => this.router.navigate(['/dashboard']), 800);
      },
      error: err => {
        this.loading = false;
        const data   = err.error;
        if (data?.username) this.errorMsg = 'Username: ' + data.username[0];
        else if (data?.email) this.errorMsg = 'Email: ' + data.email[0];
        else if (data?.password) this.errorMsg = 'Password: ' + data.password[0];
        else this.errorMsg = 'Registration failed. Please try again.';
      }
    });
  }
}
