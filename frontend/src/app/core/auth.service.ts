import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8000/api';
  private readonly ACCESS_KEY  = 'et_access';
  private readonly REFRESH_KEY = 'et_refresh';
  private readonly USER_KEY    = 'et_user';

  currentUser = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  register(data: { username: string; email: string; password: string; first_name?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register/`, data).pipe(
      tap(res => this.persist(res))
    );
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login/`, credentials).pipe(
      tap(res => this.persist(res))
    );
  }

  logout(): void {
    const refresh = localStorage.getItem(this.REFRESH_KEY);
    if (refresh) {
      this.http.post(`${this.API}/logout/`, { refresh }).subscribe({ error: () => {} });
    }
    this.clear();
    this.router.navigate(['/login']);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(this.ACCESS_KEY, res.access);
    localStorage.setItem(this.REFRESH_KEY, res.refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private clear(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
