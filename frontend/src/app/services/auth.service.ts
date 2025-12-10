  // src/app/services/auth.service.ts
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { environment } from '../../environments/environment';
  import { Observable, tap } from 'rxjs';

  interface TokenResponse { access: string; refresh: string; }

  @Injectable({ providedIn: 'root' })
  export class AuthService {
    private api = environment.apiBaseUrl;
    private usernameKey = 'username';

    constructor(private http: HttpClient) {}

    login(username: string, password: string): Observable<TokenResponse> {
      return this.http.post<TokenResponse>(`${this.api}login/`, { username, password }).pipe(
        tap(tokens => {
          this.saveTokens(tokens);
          localStorage.setItem(this.usernameKey, username);
        })
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
    get username() { return localStorage.getItem(this.usernameKey); }

    logout() {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem(this.usernameKey);
    }

    isLoggedIn(): boolean {
      return !!this.access;
    }
      /** Request OTP email for password reset */
  requestPasswordReset(email: string) {
    // Backend expects { email }
    return this.http.post<{ ok: boolean; message: string }>(
      `${this.api}auth/password-reset/`,
      { email }
    );
  }

  /** Verify OTP code */
  verifyPasswordOtp(email: string, code: string) {
    // Backend expects { email, code }
    return this.http.post<{ valid: boolean }>(
      `${this.api}auth/password-reset/verify/`,
      { email, code }
    );
  }

  /** Confirm reset with new password */
  resetPassword(email: string, code: string, new_password: string) {
    // Backend expects { email, code, new_password }
    return this.http.post<{ ok: boolean }>(
      `${this.api}auth/password-reset/confirm/`,
      { email, code, new_password }
    );
  }
}
