import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: adjust this API URL/port to match your backend launchSettings
  private readonly apiBaseUrl = 'http://localhost:5000/api';
  private readonly tokenKey = 'mb_token';
  private readonly expiresKey = 'mb_expires';
  private readonly userKey = 'mb_user';
  private readonly rolesKey = 'mb_roles';

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, request)
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.expiresKey, res.expiresAt);
          localStorage.setItem(this.userKey, res.username);
          localStorage.setItem(this.rolesKey, JSON.stringify(res.roles));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiresKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.rolesKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const expires = localStorage.getItem(this.expiresKey);
    if (!token || !expires) {
      return false;
    }
    const expiresDate = new Date(expires);
    return expiresDate > new Date();
  }

  getRoles(): string[] {
    const raw = localStorage.getItem(this.rolesKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  }
}

