import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="admin-container">
      <mat-sidenav mode="side" opened class="admin-sidenav">
        <div class="sidenav-header">
          <h2>Admin Panel</h2>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/admin/users" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>User Management</span>
          </a>
          <a mat-list-item routerLink="/admin/branches" routerLinkActive="active-link">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Branch Management</span>
          </a>
          <mat-divider></mat-divider>
          <a mat-list-item routerLink="/dashboard">
            <mat-icon matListItemIcon>arrow_back</mat-icon>
            <span matListItemTitle>Exit Admin</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>MediBilling Admin Portal</span>
          <span class="spacer"></span>
          <button mat-icon-button (click)="logout()" title="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-container {
      height: 100vh;
    }
    .admin-sidenav {
      width: 250px;
      border-right: 1px solid rgba(0,0,0,0.12);
    }
    .sidenav-header {
      padding: 16px;
      text-align: center;
      background: #f5f5f5;
      border-bottom: 1px solid rgba(0,0,0,0.12);
    }
    .admin-content {
      padding: 20px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .active-link {
      background: rgba(0,0,0,0.04);
      color: #3f51b5;
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private auth: AuthService) { }

  logout(): void {
    this.auth.logout();
  }
}


