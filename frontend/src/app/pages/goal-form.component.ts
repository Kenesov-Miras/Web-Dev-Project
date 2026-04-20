import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../layout/navbar.component';
import { ApiService } from '../core/api.service';
import { Goal } from '../core/models';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <main class="main-content">
        <div class="page-wrapper">

          <div class="page-header">
            <div class="page-title-group">
              <h1 class="page-title">Savings Goals</h1>
              <p class="page-subtitle">Set and track your financial goals</p>
            </div>
          </div>

          <div class="goals-layout">
            <!-- Create Goal Form -->
            <div class="form-card">
              <h3 style="margin-bottom:20px;font-family:var(--font-display)">🎯 New Goal</h3>

              @if (errorMsg)   { <div class="alert alert-danger">⚠️ {{ errorMsg }}</div> }
              @if (successMsg) { <div class="alert alert-success">✅ {{ successMsg }}</div> }

              <form (ngSubmit)="onSubmit()" #goalForm="ngForm">
                <div class="form-group">
                  <label class="form-label">Goal Title <span class="req">*</span></label>
                  <input class="form-control" type="text" placeholder="e.g. Emergency Fund"
                    [(ngModel)]="form.title" name="title" required />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Target Amount ($) <span class="req">*</span></label>
                    <div class="input-group">
                      <span class="input-prefix">$</span>
                      <input class="form-control" type="number" placeholder="5000.00"
                        [(ngModel)]="form.target_amount" name="target_amount" required min="1" step="0.01" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Already Saved ($)</label>
                    <div class="input-group">
                      <span class="input-prefix">$</span>
                      <input class="form-control" type="number" placeholder="0.00"
                        [(ngModel)]="form.current_amount" name="current_amount" min="0" step="0.01" />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Target Date</label>
                  <input class="form-control" type="date" [(ngModel)]="form.deadline" name="deadline" />
                </div>

                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" placeholder="What is this goal for?"
                    [(ngModel)]="form.description" name="description" rows="2"></textarea>
                </div>

                <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
                  @if (loading) { <span class="btn-spinner"></span> Saving… }
                  @else { 🎯 Create Goal }
                </button>
              </form>
            </div>

            <!-- Goals List -->
            <div class="goals-cards">
              @if (loadingList) {
                <div class="spinner-wrap"><div class="spinner"></div></div>
              } @else if (goals.length === 0) {
                <div class="card">
                  <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <div class="empty-title">No goals yet</div>
                    <div class="empty-desc">Create your first savings goal.</div>
                  </div>
                </div>
              } @else {
                @for (goal of goals; track goal.id) {
                  <div class="goal-card" [class.completed]="goal.is_completed">
                    <div class="goal-card-header">
                      <div class="goal-card-title">{{ goal.title }}</div>
                      @if (goal.is_completed) {
                        <span class="badge badge-success">✅ Completed</span>
                      } @else {
                        <span class="goal-pct">{{ goal.progress_percentage }}%</span>
                      }
                    </div>

                    @if (goal.description) {
                      <p class="goal-desc">{{ goal.description }}</p>
                    }

                    <div class="progress-bar" style="margin: 12px 0 8px">
                      <div class="progress-fill"
                        [class.success]="goal.progress_percentage >= 100"
                        [class.warning]="goal.progress_percentage >= 75 && goal.progress_percentage < 100"
                        [style.width.%]="goal.progress_percentage">
                      </div>
                    </div>

                    <div class="goal-amounts">
                      <span class="saved">
                        <span class="saved-label">Saved</span>
                        <strong>{{ goal.current_amount | currency:'USD':'symbol':'1.0-0' }}</strong>
                      </span>
                      <span class="remaining">
                        <span class="saved-label">Target</span>
                        <strong>{{ goal.target_amount | currency:'USD':'symbol':'1.0-0' }}</strong>
                      </span>
                    </div>

                    @if (goal.deadline) {
                      <div class="goal-deadline">📅 Target date: {{ goal.deadline }}</div>
                    }
                  </div>
                }
              }
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    .goals-layout {
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
    .goals-cards { display: flex; flex-direction: column; gap: 16px; }

    .goal-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 22px;
      box-shadow: var(--shadow-card);
      transition: all var(--transition);
    }
    .goal-card:hover { box-shadow: var(--shadow-md); }
    .goal-card.completed { opacity: .75; }

    .goal-card-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .goal-card-title {
      font-family: var(--font-display);
      font-weight: 600; font-size: 1.05rem;
      color: var(--text-primary);
    }
    .goal-pct {
      font-size: .9rem; font-weight: 700;
      color: var(--primary);
      background: var(--primary-bg);
      padding: 3px 10px;
      border-radius: var(--radius-full);
    }
    .goal-desc { font-size: .82rem; color: var(--text-muted); margin-bottom: 4px; }
    .goal-amounts {
      display: flex; justify-content: space-between;
      margin-top: 8px;
    }
    .saved, .remaining {
      display: flex; flex-direction: column; gap: 1px;
    }
    .saved-label { font-size: .7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }
    .goal-deadline { font-size: .78rem; color: var(--text-muted); margin-top: 10px; }

    .btn-spinner {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
      border-radius: 50%; animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) {
      .goals-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class GoalFormComponent implements OnInit {
  form = {
    title: '',
    target_amount: null as number | null,
    current_amount: 0,
    deadline: '',
    description: ''
  };
  goals:       Goal[] = [];
  loading      = false;
  loadingList  = true;
  errorMsg     = '';
  successMsg   = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadGoals(); }

  loadGoals(): void {
    this.api.getGoals().subscribe({
      next: list => { this.goals = list; this.loadingList = false; },
      error: () => this.loadingList = false
    });
  }

  onSubmit(): void {
    if (!this.form.title || !this.form.target_amount) return;
    this.loading = true; this.errorMsg = '';

    const payload: Partial<import('../core/models').Goal> = {
      title:          this.form.title,
      target_amount:  this.form.target_amount as number,
      current_amount: this.form.current_amount,
      deadline:       this.form.deadline || null,
      description:    this.form.description
    };

    this.api.createGoal(payload).subscribe({
      next: goal => {
        this.goals.unshift(goal);
        this.loading    = false;
        this.successMsg = 'Goal created!';
        this.form = { title: '', target_amount: null, current_amount: 0, deadline: '', description: '' };
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.loading = false; this.errorMsg = 'Failed to create goal.'; }
    });
  }
}