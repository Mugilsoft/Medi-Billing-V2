import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    template: `
    <div class="admin-dashboard">
      <h1>Administrative Dashboard</h1>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">people</mat-icon>
            <mat-card-title>Users</mat-card-title>
            <mat-card-subtitle>System Users</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">Manage system access</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="accent">business</mat-icon>
            <mat-card-title>Branches</mat-card-title>
            <mat-card-subtitle>Medical Center Locations</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">Manage branch data</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .admin-dashboard {
      padding: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .stat-card {
      padding: 16px;
    }
    .stat-value {
      font-size: 1.2rem;
      font-weight: 500;
      margin-top: 10px;
    }
  `]
})
export class AdminDashboardComponent { }
