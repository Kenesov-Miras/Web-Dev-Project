import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../layout/navbar.component';
import { ApiService } from '../core/api.service';
import { Income } from '../core/models';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <main class="main-content">
        <div class="page-wrapper">

          <div class="page-header">
            <div class="page-title-group">
              <h1 class="page-title">Income</h1>
              <p class="page-subtitle">Track your earnings</p>
            </div>
          </div>

          <div class="income-layout">
            <!-- Add Income Form -->
            <div class="form-card">
              <h3 style="margin-bottom:20px;font-family:var(--font-display)">💰 Add Income</h3>

              @if (errorMsg)   { <div class="alert alert-danger">⚠️ {{ errorMsg }}</div> }
              @if (successMsg) { <div class="alert alert-success">✅ {{ successMsg }}</div> }

              <form (ngSubmit)="onSubmit()" #incomeForm="ngForm">
                <div class="form-group">
                  <label class="form-label">Title <span class="req">*</span></label>
                  <input class="form-control" type="text" placeholder="e.g. Monthly Salary"
                    [(ngModel)]="form.title" name="title" required />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Amount ($) <span class="req">*</span></label>
                    <div class="input-group">
                      <span class="input-prefix">$</span>
                      <input class="form-control" type="number" placeholder="0.00"
                        [(ngModel)]="form.amount" name="amount" required min="0.01" step="0.01" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Source</label>
                    <select class="form-control" [(ngModel)]="form.source" name="source">
                      <option value="salary">💼 Salary</option>
                      <option value="freelance">🖥️ Freelance</option>
                      <option value="business">🏢 Business</option>
                      <option value="investment">📈 Investment</option>
                      <option value="gift">🎁 Gift</option>
                      <option value="other">💰 Other</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Date <span class="req">*</span></label>
                  <input class="form-control" type="date" [(ngModel)]="form.date" name="date" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Note</label>
                  <textarea class="form-control" placeholder="Optional note…"
                    [(ngModel)]="form.note" name="note" rows="2"></textarea>
                </div>

                <button type="submit" class="btn btn-success btn-full" [disabled]="loading">
                  @if (loading) { <span class="btn-spinner"></span> Saving… }
                  @else { ✓ Add Income }
                </button>
              </form>
            </div>

            <!-- Income List -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Income History</div>
                <div class="total-income">
                  Total: <strong style="color:var(--success)">{{ totalIncome | currency:'USD':'symbol':'1.0-0' }}</strong>
                </div>
              </div>

              @if (loadingList) {
                <div class="spinner-wrap"><div class="spinner"></div></div>
              } @else if (incomes.length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">💸</div>
                  <div class="empty-title">No income records yet</div>
                  <div class="empty-desc">Add your first income entry.</div>
                </div>
              } @else {
                <div class="income-list">
                  @for (inc of incomes; track inc.id) {
                    <div class="income-item">
                      <div class="income-icon">{{ sourceIcon(inc.source) }}</div>
                      <div class="income-info">
                        <div class="income-title">{{ inc.title }}</div>
                        <div class="income-meta">{{ sourceLabel(inc.source) }} · {{ inc.date }}</div>
                      </div>
                      <div class="income-amount">+{{ inc.amount | currency:'USD':'symbol':'1.2-2' }}</div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    .income-layout {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 24px;
      align-items: start;
    }
    .form-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      box-shadow: var(--shadow-card);
    }
    .req { color: var(--danger); }
    .total-income { font-size: .88rem; }
    .income-list { display: flex; flex-direction: column; gap: 4px; }
    .income-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 8px; border-radius: var(--radius-md);
      transition: background var(--transition);
    }
    .income-item:hover { background: var(--surface-2); }
    .income-icon {
      width: 38px; height: 38px;
      border-radius: var(--radius-md);
      background: var(--success-bg);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; flex-shrink: 0;
    }
    .income-info { flex: 1; min-width: 0; }
    .income-title { font-size: .88rem; font-weight: 500; color: var(--text-primary); }
    .income-meta { font-size: .75rem; color: var(--text-muted); margin-top: 1px; }
    .income-amount { font-weight: 700; color: var(--success); white-space: nowrap; }
    .btn-spinner {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
      border-radius: 50%; animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) {
      .income-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class IncomeFormComponent implements OnInit {
  form = {
    title: '', amount: null as number | null,
    source: 'salary', date: new Date().toISOString().split('T')[0], note: ''
  };
  incomes:     Income[] = [];
  loading      = false;
  loadingList  = true;
  errorMsg     = '';
  successMsg   = '';

  get totalIncome(): number { return this.incomes.reduce((s, i) => s + +i.amount, 0); }

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadIncomes(); }

  loadIncomes(): void {
    this.api.getIncomes().subscribe({
      next: list => { this.incomes = list; this.loadingList = false; },
      error: () => this.loadingList = false
    });
  }

  onSubmit(): void {
    if (!this.form.title || !this.form.amount || !this.form.date) return;
    this.loading = true; this.errorMsg = '';
    const payload: Partial<import('../core/models').Income> = {
      title:  this.form.title,
      amount: this.form.amount as number,
      source: this.form.source,
      date:   this.form.date,
      note:   this.form.note
    };
    this.api.createIncome(payload).subscribe({
      next: inc => {
        this.incomes.unshift(inc);
        this.loading    = false;
        this.successMsg = 'Income added!';
        this.form = { title: '', amount: null, source: 'salary', date: new Date().toISOString().split('T')[0], note: '' };
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.loading = false; this.errorMsg = 'Failed to add income.'; }
    });
  }

  sourceIcon(s: string): string {
    const map: Record<string, string> = {
      salary: '💼', freelance: '🖥️', business: '🏢',
      investment: '📈', gift: '🎁', other: '💰'
    };
    return map[s] || '💰';
  }

  sourceLabel(s: string): string {
    const map: Record<string, string> = {
      salary: 'Salary', freelance: 'Freelance', business: 'Business',
      investment: 'Investment', gift: 'Gift', other: 'Other'
    };
    return map[s] || s;
  }
}