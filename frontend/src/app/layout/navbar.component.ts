import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">💸</div>
          <div class="brand-text">
            <span class="brand-name">Spendly</span>
            <span class="brand-tagline">Finance Tracker</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-label">Main</span>

          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </a>

          <a routerLink="/expenses" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💳</span>
            <span class="nav-label">Expenses</span>
          </a>

          <a routerLink="/expenses/new" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">➕</span>
            <span class="nav-label">Add Expense</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-label">Finance</span>

          <a routerLink="/income" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💰</span>
            <span class="nav-label">Income</span>
          </a>

          <a routerLink="/goals" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🎯</span>
            <span class="nav-label">Savings Goals</span>
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">{{ avatarLetter() }}</div>
          <div class="user-info">
            <span class="user-name">{{ displayName() }}</span>
            <span class="user-email">{{ user()?.email }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()">
          <span>⏻</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0; left: 0;
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 100;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(99,102,241,.35);
      flex-shrink: 0;
    }

    .brand-name {
      display: block;
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .brand-tagline {
      display: block;
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .nav-section { display: flex; flex-direction: column; gap: 2px; }

    .nav-section-label {
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--text-muted);
      padding: 0 10px;
      margin-bottom: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: all var(--transition);
    }

    .nav-item:hover {
      background: var(--surface-2);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--primary-bg);
      color: var(--primary-dark);
      font-weight: 600;
    }

    .nav-icon { font-size: 1rem; flex-shrink: 0; }
    .nav-label { flex: 1; }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: var(--radius-md);
      background: var(--surface-2);
    }

    .user-avatar {
      width: 34px; height: 34px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .user-name {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      display: block;
      font-size: 0.72rem;
      color: var(--text-muted);
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 9px;
      border-radius: var(--radius-md);
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
    }

    .logout-btn:hover {
      background: var(--danger-bg);
      color: var(--danger);
      border-color: #fca5a5;
    }
  `]
})
export class NavbarComponent {
  user   = this.auth.currentUser;
  displayName = computed(() => this.user()?.first_name || this.user()?.username || 'User');
  avatarLetter = computed(() => (this.displayName()[0] || 'U').toUpperCase());

  constructor(private auth: AuthService) {}

  logout() { this.auth.logout(); }
}
