import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Category, Expense, Income, Goal, Stats, ExpenseFilter
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.BASE}/stats/`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.BASE}/categories/`);
  }

  createCategory(data: { name: string; icon: string; color: string }): Observable<Category> {
    return this.http.post<Category>(`${this.BASE}/categories/`, data);
  }

  getExpenses(filters?: ExpenseFilter): Observable<Expense[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params = params.set(k, v);
      });
    }
    return this.http.get<Expense[]>(`${this.BASE}/expenses/`, { params });
  }

  createExpense(data: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(`${this.BASE}/expenses/`, data);
  }

  getExpense(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.BASE}/expenses/${id}/`);
  }

  updateExpense(id: number, data: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.BASE}/expenses/${id}/`, data);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/expenses/${id}/`);
  }

  getIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.BASE}/incomes/`);
  }

  createIncome(data: Partial<Income>): Observable<Income> {
    return this.http.post<Income>(`${this.BASE}/incomes/`, data);
  }

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.BASE}/goals/`);
  }

  createGoal(data: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(`${this.BASE}/goals/`, data);
  }
}
