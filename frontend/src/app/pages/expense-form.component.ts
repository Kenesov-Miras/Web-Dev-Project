import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../layout/navbar.component';
import { ApiService } from '../core/api.service';
import { Category } from '../core/models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <main class="main-content">
        <div class="page-wrapper">

          <div class="page-header">
            <div class="page-title-group">
              <h1 class="page-title">{{ isEdit ? 'Edit Expense' : 'Add Expense' }}</h1>
              <p class="page-subtitle">{{ isEdit ? 'Update expense details' : 'Record a new expense' }}</p>
            </div>
            <a routerLink="/expenses" class="btn btn-secondary">← Back to Expenses</a>
          </div>

          @if (errorMsg) {
            <div class="alert alert-danger">⚠️ {{ errorMsg }}</div>
          }
          @if (successMsg) {
            <div class="alert alert-success">✅ {{ successMsg }}</div>
          }

          <div class="form-card">
            @if (loadingExpense) {
              <div class="spinner-wrap"><div class="spinner"></div></div>
            } @else {
              <form (ngSubmit)="onSubmit()" #expenseForm="ngForm">

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Title <span class="req">*</span></label>
                    <input
                      class="form-control"
                      [class.error]="expenseForm.submitted && !form.title"
                      type="text"
                      placeholder="e.g. Grocery shopping"
                      [(ngModel)]="form.title"
                      name="title"
                      required
                    />
                    @if (expenseForm.submitted && !form.title) {
                      <span class="field-error">Title is required</span>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label">Amount ($) <span class="req">*</span></label>
                    <div class="input-group">
                      <span class="input-prefix">$</span>
                      <input
                        class="form-control"
                        [class.error]="expenseForm.submitted && !form.amount"
                        type="number"
                        placeholder="0.00"
                        [(ngModel)]="form.amount"
                        name="amount"
                        required
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    @if (expenseForm.submitted && !form.amount) {
                      <span class="field-error">Amount is required</span>
                    }
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Category <span class="req">*</span></label>
                    <select class="form-control" [(ngModel)]="form.category" name="category" required>
                      <option value="">Select category…</option>
                      @for (cat of categories; track cat.id) {
                        <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                      }
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Date <span class="req">*</span></label>
                    <input
                      class="form-control"
                      type="date"
                      [(ngModel)]="form.date"
                      name="date"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Note</label>
                  <textarea
                    class="form-control"
                    placeholder="Optional note about this expense…"
                    [(ngModel)]="form.note"
                    name="note"
                    rows="3"
                  ></textarea>
                </div>

                <!-- Custom Category -->
                <div class="custom-category-section">
                  <button type="button" class="btn btn-secondary btn-sm" (click)="toggleCustomCat()">
                    {{ showCustomCat ? '✕ Cancel' : '+ Create Custom Category' }}
                  </button>

                  @if (showCustomCat) {
                    <div class="custom-cat-form">
                      <div class="form-row">
                        <div class="form-group">
                          <label class="form-label">Category Name</label>
                          <input class="form-control" type="text" placeholder="e.g. Pets"
                            [(ngModel)]="newCat.name" name="newCatName" />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Icon (emoji)</label>
                          <input class="form-control" type="text" placeholder="🐾"
                            [(ngModel)]="newCat.icon" name="newCatIcon" maxlength="4" />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Color</label>
                          <input class="form-control color-input" type="color"
                            [(ngModel)]="newCat.color" name="newCatColor" />
                        </div>
                      </div>
                      <button type="button" class="btn btn-success btn-sm" (click)="createCategory()" [disabled]="!newCat.name">
                        Save Category
                      </button>
                    </div>
                  }
                </div>

                <hr class="divider" />

                <div class="form-actions">
                  <a routerLink="/expenses" class="btn btn-secondary">Cancel</a>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    @if (loading) {
                      <span class="btn-spinner"></span> Saving…
                    } @else {
                      {{ isEdit ? '✓ Update Expense' : '✓ Add Expense' }}
                    }
                  </button>
                </div>

              </form>
            }
          </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    .form-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 32px;
      max-width: 720px;
      box-shadow: var(--shadow-card);
    }
    .req { color: var(--danger); }
    .field-error { font-size: .78rem; color: var(--danger); margin-top: 3px; }
    .custom-category-section { margin-bottom: 8px; }
    .custom-cat-form {
      margin-top: 14px;
      padding: 16px;
      background: var(--surface-2);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .color-input { padding: 4px 8px; height: 42px; cursor: pointer; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-spinner {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
      border-radius: 50%; animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ExpenseFormComponent implements OnInit {
  form = {
    title: '',
    amount: null as number | null,
    category: '' as string | number,
    date: new Date().toISOString().split('T')[0],
    note: ''
  };

  categories:    Category[] = [];
  isEdit         = false;
  expenseId: number | null = null;
  loading        = false;
  loadingExpense = false;
  errorMsg       = '';
  successMsg     = '';
  showCustomCat  = false;
  newCat         = { name: '', icon: '💰', color: '#6366f1' };

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe(cats => this.categories = cats);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit    = true;
      this.expenseId = +id;
      this.loadExpense(+id);
    }
  }

  loadExpense(id: number): void {
    this.loadingExpense = true;
    this.api.getExpense(id).subscribe({
      next: exp => {
        this.form = {
          title:    exp.title,
          amount:   +exp.amount,
          category: exp.category ?? '',
          date:     exp.date,
          note:     exp.note
        };
        this.loadingExpense = false;
      },
      error: () => {
        this.errorMsg       = 'Could not load expense.';
        this.loadingExpense = false;
      }
    });
  }

  toggleCustomCat(): void { this.showCustomCat = !this.showCustomCat; }

  createCategory(): void {
    if (!this.newCat.name) return;
    this.api.createCategory(this.newCat).subscribe({
      next: cat => {
        this.categories.push(cat);
        this.form.category = cat.id;
        this.showCustomCat = false;
        this.newCat = { name: '', icon: '💰', color: '#6366f1' };
      },
      error: () => this.errorMsg = 'Failed to create category.'
    });
  }

  onSubmit(): void {
    if (!this.form.title || !this.form.amount || !this.form.date) return;
    this.loading  = true;
    this.errorMsg = '';

    const catVal = this.form.category;
    const payload: Partial<import('../core/models').Expense> = {
      title:    this.form.title,
      amount:   this.form.amount!,
      category: catVal ? Number(catVal) : null,
      date:     this.form.date,
      note:     this.form.note
    };

    const call = this.isEdit && this.expenseId
      ? this.api.updateExpense(this.expenseId, payload)
      : this.api.createExpense(payload);

    call.subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = this.isEdit ? 'Expense updated!' : 'Expense added!';
        setTimeout(() => this.router.navigate(['/expenses']), 800);
      },
      error: err => {
        this.loading  = false;
        this.errorMsg = err.error?.detail || 'Something went wrong. Please try again.';
      }
    });
  }
}