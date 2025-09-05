// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

interface TokenResponse { access: string; refresh: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiBaseUrl; // e.g. http://localhost:8000/api/

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.api}login/`, { username, password }).pipe(
      tap(tokens => this.saveTokens(tokens))
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.api}register/`, { username, email, password });
  }

  refresh(refresh: string) {
    return this.http.post<{ access: string }>(`${this.api}token/refresh/`, { refresh })
      .pipe(tap(r => localStorage.setItem('access', r.access)));
  }

  saveTokens(t: TokenResponse) {
    localStorage.setItem('access', t.access);
    localStorage.setItem('refresh', t.refresh);
  }

  get access()  { return localStorage.getItem('access'); }
  get refreshT() { return localStorage.getItem('refresh'); }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  isLoggedIn(): boolean {
    return !!this.access;
  }
}
