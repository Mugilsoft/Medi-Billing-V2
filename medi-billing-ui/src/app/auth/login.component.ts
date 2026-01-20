import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>MediBilling Login</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              name="username"
              [(ngModel)]="username"
              required
              autocomplete="username"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              [(ngModel)]="password"
              required
              autocomplete="current-password"
            />
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        <p class="hint">Default admin: admin / admin123</p>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0f5ba7, #34a0a4);
        padding: 16px;
      }
      .login-card {
        background: #ffffff;
        padding: 24px 32px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        width: 100%;
        max-width: 360px;
      }
      h2 {
        margin-bottom: 24px;
        text-align: center;
        color: #0f5ba7;
      }
      .form-group {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
      }
      label {
        margin-bottom: 4px;
        font-weight: 600;
      }
      input {
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        font-size: 14px;
      }
      button {
        width: 100%;
        padding: 10px 0;
        border: none;
        border-radius: 6px;
        background-color: #0f5ba7;
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
      button[disabled] {
        opacity: 0.7;
        cursor: default;
      }
      .error {
        color: #b91c1c;
        margin-bottom: 8px;
        font-size: 13px;
      }
      .hint {
        margin-top: 12px;
        font-size: 12px;
        color: #64748b;
        text-align: center;
      }
    `,
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;
    this.auth
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.error ?? 'Login failed. Please check your credentials.';
        },
      });
  }
}

