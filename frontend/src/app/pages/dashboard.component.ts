// src/app/pages/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartData,
  ChartOptions,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  DoughnutController,
  BarController,
  LineController
} from 'chart.js';
import { NavbarComponent } from '../layout/navbar.component';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Stats } from '../core/models';

Chart.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Filler,
  DoughnutController, BarController, LineController
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, NavbarComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <main class="main-content">
        <div class="page-wrapper">

          <div class="page-header">
            <div class="page-title-group">
              <h1 class="page-title">Dashboard</h1>
              <p class="page-subtitle">{{ greeting }}, {{ displayName }}!</p>
            </div>
            <a routerLink="/expenses/new" class="btn btn-primary">➕ Добавить расход</a>
          </div>

          @if (loading) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else {

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon income">💰</div>
                <div class="stat-info">
                  <div class="stat-label">Доходы</div>
                  <div class="stat-value positive">{{ stats?.total_income | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon expense">💳</div>
                <div class="stat-info">
                  <div class="stat-label">Расходы</div>
                  <div class="stat-value negative">{{ stats?.total_expense | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon balance">⚖️</div>
                <div class="stat-info">
                  <div class="stat-label">Баланс</div>
                  <div class="stat-value"
                    [class.positive]="(stats?.balance || 0) >= 0"
                    [class.negative]="(stats?.balance || 0) < 0">
                    {{ stats?.balance | currency:'USD':'symbol':'1.0-0' }}
                  </div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon goal">🎯</div>
                <div class="stat-info">
                  <div class="stat-label">Активные цели</div>
                  <div class="stat-value">{{ stats?.goal_progress?.length || 0 }}</div>
                </div>
              </div>
            </div>

            <div class="charts-grid">
              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">По категориям</div>
                    <div class="card-subtitle">Всё время</div>
                  </div>
                </div>
                @if ((stats?.expense_by_category?.length || 0) > 0) {
                  <div class="chart-container doughnut-container">
                    <canvas baseChart [data]="doughnutData" [options]="doughnutOptions" [type]="'doughnut'"></canvas>
                  </div>
                  <div class="legend-list">
                    @for (item of stats?.expense_by_category || []; track item.name) {
                      <div class="legend-item">
                        <span class="cat-dot" [style.background]="item.color"></span>
                        <span class="legend-name">{{ item.icon }} {{ item.name }}</span>
                        <span class="legend-value">{{ item.total | currency:'USD':'symbol':'1.0-0' }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">Нет расходов</div>
                    <div class="empty-desc">Добавьте расходы чтобы увидеть диаграмму</div>
                  </div>
                }
              </div>

              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Расходы за неделю</div>
                    <div class="card-subtitle">Последние 7 дней</div>
                  </div>
                </div>
                <div class="chart-container">
                  <canvas baseChart [data]="barData" [options]="barOptions" [type]="'bar'"></canvas>
                </div>
              </div>
            </div>

            <div class="card" style="margin-bottom: 28px">
              <div class="card-header">
                <div>
                  <div class="card-title">Тренд за 30 дней</div>
                  <div class="card-subtitle">Ежедневная история расходов</div>
                </div>
              </div>
              <div class="chart-container">
                <canvas baseChart [data]="lineData" [options]="lineOptions" [type]="'line'"></canvas>
              </div>
            </div>

            <div class="bottom-grid">
              <div class="card">
                <div class="card-header">
                  <div class="card-title">Последние расходы</div>
                  <a routerLink="/expenses" class="btn btn-secondary btn-sm">Все →</a>
                </div>
                @if (stats?.recent_expenses?.length) {
                  <div class="recent-list">
                    @for (exp of stats?.recent_expenses || []; track exp.id) {
                      <div class="recent-item">
                        <div class="recent-icon" [style.background]="exp.category_color + '22'">{{ exp.category_icon }}</div>
                        <div class="recent-info">
                          <div class="recent-title">{{ exp.title }}</div>
                          <div class="recent-meta">{{ exp.category_name }} · {{ exp.date }}</div>
                        </div>
                        <div class="recent-amount">-{{ exp.amount | currency:'USD':'symbol':'1.0-2' }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <div class="empty-icon">🧾</div>
                    <div class="empty-title">Нет расходов</div>
                  </div>
                }
              </div>

              <div class="card">
                <div class="card-header">
                  <div class="card-title">Цели накопления</div>
                  <a routerLink="/goals" class="btn btn-secondary btn-sm">Управление</a>
                </div>
                @if (stats?.goal_progress?.length) {
                  <div class="goals-list">
                    @for (goal of stats?.goal_progress || []; track goal.id) {
                      <div class="goal-item">
                        <div class="goal-header">
                          <span class="goal-title">{{ goal.title }}</span>
                          <span class="goal-pct">{{ goal.progress }}%</span>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-fill"
                            [class.success]="goal.progress >= 100"
                            [class.warning]="goal.progress >= 75 && goal.progress < 100"
                            [style.width.%]="goal.progress">
                          </div>
                        </div>
                        <div class="goal-amounts">
                          <span>{{ goal.current | currency:'USD':'symbol':'1.0-0' }}</span>
                          <span>из {{ goal.target | currency:'USD':'symbol':'1.0-0' }}</span>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <div class="empty-title">Нет целей</div>
                    <div class="empty-desc"><a routerLink="/goals">Создайте первую цель</a></div>
                  </div>
                }
              </div>
            </div>

          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .chart-container { position: relative; height: 260px; width: 100%; }
    .doughnut-container { height: 220px; }
    .legend-list { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
    .legend-name { flex: 1; color: var(--text-secondary); }
    .legend-value { font-weight: 600; color: var(--text-primary); }
    .recent-list { display: flex; flex-direction: column; gap: 4px; }
    .recent-item { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: var(--radius-md); transition: background var(--transition); }
    .recent-item:hover { background: var(--surface-2); }
    .recent-icon { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .recent-info { flex: 1; min-width: 0; }
    .recent-title { font-size: 0.88rem; font-weight: 500; color: var(--text-primary); }
    .recent-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }
    .recent-amount { font-size: 0.9rem; font-weight: 600; color: var(--danger); white-space: nowrap; }
    .goals-list { display: flex; flex-direction: column; gap: 16px; }
    .goal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .goal-title { font-size: 0.88rem; font-weight: 500; color: var(--text-primary); }
    .goal-pct { font-size: 0.8rem; font-weight: 600; color: var(--primary); }
    .goal-amounts { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 5px; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: Stats | null = null;
  loading = true;
  greeting = '';
  displayName = '';

  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  barData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  lineData: ChartData<'line'> = { labels: [], datasets: [{ data: [] }] };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` $${(ctx.raw as number).toFixed(2)}` } }
    }
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: v => '$' + v } },
      x: { grid: { display: false } }
    }
  };

  lineOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: v => '$' + v } },
      x: { grid: { display: false }, ticks: { maxTicksLimit: 10, maxRotation: 0 } }
    }
  };

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
    const user = this.auth.currentUser();
    this.displayName = user?.first_name || user?.username || '';
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.api.getStats().subscribe({
      next: s => { this.stats = s; this.buildCharts(s); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  private buildCharts(s: Stats): void {
    this.doughnutData = {
      labels: s.expense_by_category.map(c => `${c.icon} ${c.name}`),
      datasets: [{
        data: s.expense_by_category.map(c => c.total),
        backgroundColor: s.expense_by_category.map(c => c.color),
        borderWidth: 2, borderColor: '#ffffff', hoverOffset: 8
      }]
    };

    this.barData = {
      labels: s.weekly_expenses.map(d => d.day),
      datasets: [{
        data: s.weekly_expenses.map(d => d.total),
        backgroundColor: 'rgba(99,102,241,.15)',
        borderColor: '#6366f1', borderWidth: 2, borderRadius: 6,
        hoverBackgroundColor: 'rgba(99,102,241,.35)'
      }]
    };

    this.lineData = {
      labels: s.monthly_expenses.map(d => d.day),
      datasets: [{
        data: s.monthly_expenses.map(d => d.total),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,.08)',
        tension: 0.4, fill: true, borderWidth: 2,
        pointRadius: 2, pointHoverRadius: 5
      }]
    };
  }
}