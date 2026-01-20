import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  totalSalesToday: number;
  totalSalesMonth: number;
  totalPurchasesMonth: number;
  lowStockCount: number;
  nearExpiryCount: number;
  nearExpiryItems: any[];
  mostSellingProducts: any[];
  recentSales: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <h1 class="logo">MediBilling</h1>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Dashboard
          </a>
          <a routerLink="/sales" routerLinkActive="active">Sales (Billing)</a>
          <a routerLink="/stock" routerLinkActive="active">Stock</a>
          <a routerLink="/purchases" routerLinkActive="active">Purchases</a>
          <a routerLink="/medicines" routerLinkActive="active">Medicines</a>
          <a routerLink="/suppliers" routerLinkActive="active">Suppliers</a>
          <a routerLink="/reports" routerLinkActive="active">Reports</a>
          <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" class="admin-link">Admin Panel</a>
        </nav>

        <button class="logout" (click)="logout()">Logout</button>
      </aside>
      <main class="content">
        <header class="header">
          <h2>Dashboard</h2>
        </header>

        <div class="stats-grid" *ngIf="stats">
          <div class="stat-card sales">
            <span class="label">Sales Today</span>
            <span class="value">₹{{stats.totalSalesToday.toFixed(2)}}</span>
          </div>
          <div class="stat-card sales-month">
            <span class="label">Sales This Month</span>
            <span class="value">₹{{stats.totalSalesMonth.toFixed(2)}}</span>
          </div>
          <div class="stat-card low-stock">
            <span class="label">Low Stock Items</span>
            <span class="value">{{stats.lowStockCount}}</span>
          </div>
          <div class="stat-card expiry">
            <span class="label">Near Expiry</span>
            <span class="value">{{stats.nearExpiryCount}}</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="left-col">
            <section class="card mb-24">
              <h3 class="section-title">Most Selling Products (Top 5)</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Qty Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of stats?.mostSellingProducts">
                      <td><strong>{{p.medicineName}}</strong></td>
                      <td>{{p.totalQuantity}}</td>
                      <td>₹{{p.totalRevenue.toFixed(2)}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="card">
              <h3 class="section-title">Expiring Soon (Next 30 Days)</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Batch</th>
                      <th>Expiry</th>
                      <th>Qty Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of stats?.nearExpiryItems">
                      <td><strong>{{item.medicineName}}</strong></td>
                      <td>{{item.batchNumber}}</td>
                      <td class="text-danger">{{item.expiryDate | date: 'dd/MM/yyyy'}}</td>
                      <td>{{item.availableQuantity}}</td>
                    </tr>
                    <tr *ngIf="!stats?.nearExpiryItems?.length">
                      <td colspan="4" class="no-data">No items expiring soon</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div class="right-col">
            <section class="card mb-24">
              <h3 class="section-title">Recent Sales</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Patient</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let s of stats?.recentSales">
                      <td><strong>{{s.invoiceNumber}}</strong></td>
                      <td>{{s.patientName}}</td>
                      <td>₹{{s.totalAmount.toFixed(2)}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="card quick-actions">
              <h3 class="section-title">Quick Actions</h3>
              <div class="action-buttons">
                <button routerLink="/purchases" class="btn-action">New Purchase</button>
                <button routerLink="/stock" class="btn-action secondary">View Stock</button>
                <button routerLink="/reports" class="btn-action secondary">Full Reports</button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .header { margin-bottom: 24px; }
      .header h2 { font-size: 26px; font-weight: 700; color: #f3f5f9; }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }
      .stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        border-left: 4px solid #cbd5e1;
      }
      .stat-card.sales { border-left-color: #0ea5e9; }
      .stat-card.sales-month { border-left-color: #22c55e; }
      .stat-card.low-stock { border-left-color: #f59e0b; }
      .stat-card.expiry { border-left-color: #ef4444; }
      
      .stat-card .label { font-size: 14px; color: #64748b; font-weight: 600; }
      .stat-card .value { font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 8px; }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 24px;
      }
      .card {
        background: rgba(248, 250, 252, 0.98);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
        border: 1px solid rgba(148, 163, 184, 0.3);
      }
      .mb-24 { margin-bottom: 24px; }
      .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
      .table-wrapper { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
      th { background: #f8fafc; font-weight: 600; color: #475569; }
      
      .text-danger { color: #ef4444; font-weight: 600; }

      .action-buttons { display: flex; flex-direction: column; gap: 12px; }
      .btn-action {
        padding: 12px;
        border-radius: 8px;
        border: none;
        background: #0ea5e9;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .btn-action.secondary { background: #64748b; }
      .btn-action:hover { opacity: 0.9; }

      .no-data { text-align: center; color: #94a3b8; padding: 20px !important; }

      .admin-link {
        margin-top: 12px;
        background: rgba(234, 179, 8, 0.1);
        border: 1px solid rgba(234, 179, 8, 0.3);
        color: #eab308 !important;
      }
      .admin-link:hover {
        background: rgba(234, 179, 8, 0.2);
      }
      .admin-link.active {
        background: #eab308 !important;
        color: #0f172a !important;
      }


      @media (max-width: 1024px) {
        .dashboard-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.http.get<DashboardStats>(`${this.apiBaseUrl}/dashboard/stats`)
      .subscribe(res => this.stats = res);
  }

  get isAdmin(): boolean {
    return this.auth.getRoles().includes('Admin');
  }


  logout(): void {
    this.auth.logout();
  }
}

