import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../layout/navbar.component';
import { ApiService } from '../core/api.service';
import { Expense, Category, ExpenseFilter } from '../core/models';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <main class="main-content">
        <div class="page-wrapper">

          <div class="page-header">
            <div class="page-title-group">
              <h1 class="page-title">Expenses</h1>
              <p class="page-subtitle">{{ filtered.length }} of {{ expenses.length }} records</p>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-secondary" (click)="loadAll()">🔄 Refresh</button>
              <a routerLink="/expenses/new" class="btn btn-primary">➕ Add Expense</a>
            </div>
          </div>

          @if (successMsg) {
            <div class="alert alert-success">✅ {{ successMsg }}</div>
          }
          @if (errorMsg) {
            <div class="alert alert-danger">⚠️ {{ errorMsg }}</div>
          }

          <!-- Filter Bar -->
          <div class="filter-bar">
            <input
              class="form-control"
              type="text"
              placeholder="🔍 Search by title…"
              [(ngModel)]="filter.search"
              (ngModelChange)="applyFilters()"
            />
            <select class="form-control" [(ngModel)]="filter.category" (ngModelChange)="applyFilters()">
              <option value="">All Categories</option>
              @for (cat of categories; track cat.id) {
                <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
              }
            </select>
            <input
              class="form-control"
              type="date"
              [(ngModel)]="filter.date_from"
              (ngModelChange)="applyFilters()"
              title="From date"
            />
            <input
              class="form-control"
              type="date"
              [(ngModel)]="filter.date_to"
              (ngModelChange)="applyFilters()"
              title="To date"
            />
            <div class="input-group" style="min-width:130px">
              <span class="input-prefix">$</span>
              <input
                class="form-control"
                type="number"
                placeholder="Min amount"
                [(ngModel)]="filter.min_amount"
                (ngModelChange)="applyFilters()"
                min="0"
              />
            </div>
            <button class="btn btn-secondary btn-sm" (click)="clearFilters()">✕ Clear</button>
          </div>

          @if (loading) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else if (filtered.length === 0) {
            <div class="card">
              <div class="empty-state">
                <div class="empty-icon">🧾</div>
                <div class="empty-title">No expenses found</div>
                <div class="empty-desc">Try adjusting your filters or add a new expense.</div>
              </div>
            </div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Note</th>
                    <th style="text-align:center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (exp of filtered; track exp.id) {
                    <tr>
                      <td>
                        <div style="display:flex;align-items:center;gap:8px">
                          <span class="cat-icon-sm" [style.background]="exp.category_color + '22'">
                            {{ exp.category_icon }}
                          </span>
                          {{ exp.title }}
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-primary">
                          <span class="cat-dot" [style.background]="exp.category_color"></span>
                          {{ exp.category_name }}
                        </span>
                      </td>
                      <td><strong style="color:var(--danger)">-{{ exp.amount | currency:'USD':'symbol':'1.2-2' }}</strong></td>
                      <td>{{ exp.date }}</td>
                      <td>
                        <span class="note-cell" [title]="exp.note">
                          {{ exp.note || '—' }}
                        </span>
                      </td>
                      <td>
                        <div style="display:flex;gap:6px;justify-content:center">
                          <a [routerLink]="['/expenses/edit', exp.id]" class="btn-icon edit" title="Edit">✏️</a>
                          <button class="btn-icon danger" (click)="deleteExpense(exp)" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Total row -->
            <div class="total-bar">
              <span>Total: <strong style="color:var(--danger)">{{ totalAmount | currency:'USD':'symbol':'1.2-2' }}</strong></span>
              <span style="color:var(--text-muted);font-size:.83rem">{{ filtered.length }} expense{{ filtered.length !== 1 ? 's' : '' }}</span>
            </div>
          }

        </div>
      </main>
    </div>
  `,
  styles: [`
    .cat-icon-sm {
      width: 28px; height: 28px;
      border-radius: 6px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: .85rem; flex-shrink: 0;
    }
    .note-cell {
      display: block; max-width: 160px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      color: var(--text-muted); font-size: .82rem;
    }
    .total-bar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-top: none;
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      font-size: .88rem;
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenses:   Expense[]  = [];
  filtered:   Expense[]  = [];
  categories: Category[] = [];
  loading    = true;
  successMsg = '';
  errorMsg   = '';

  filter: ExpenseFilter = {
    search: '', category: '', date_from: '', date_to: '', min_amount: ''
  };

  get totalAmount(): number {
    return this.filtered.reduce((s, e) => s + +e.amount, 0);
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe(cats => this.categories = cats);
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.api.getExpenses().subscribe({
      next: exps => {
        this.expenses = exps;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load expenses.'; }
    });
  }

  applyFilters(): void {
    let result = [...this.expenses];
    const f = this.filter;

    if (f.search)      result = result.filter(e => e.title.toLowerCase().includes(f.search!.toLowerCase()));
    if (f.category)    result = result.filter(e => String(e.category) === f.category);
    if (f.date_from)   result = result.filter(e => e.date >= f.date_from!);
    if (f.date_to)     result = result.filter(e => e.date <= f.date_to!);
    if (f.min_amount)  result = result.filter(e => +e.amount >= +f.min_amount!);

    this.filtered = result;
  }

  clearFilters(): void {
    this.filter = { search: '', category: '', date_from: '', date_to: '', min_amount: '' };
    this.applyFilters();
  }

  deleteExpense(exp: Expense): void {
    if (!confirm(`Delete "${exp.title}"?`)) return;
    this.api.deleteExpense(exp.id).subscribe({
      next: () => {
        this.expenses = this.expenses.filter(e => e.id !== exp.id);
        this.applyFilters();
        this.showSuccess('Expense deleted successfully.');
      },
      error: () => this.errorMsg = 'Failed to delete expense.'
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }
}
