import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface StockItem {
    id: number;
    medicineId: number;
    medicineName: string;
    branchId: number;
    branchName: string;
    batchNumber: string;
    manufactureDate?: string;
    expiryDate: string;
    availableQuantity: number;
    purchasePrice: number;
    salePrice: number;
}

interface StockAlert extends StockItem {
    isNearExpiry: boolean;
    isLowStock: boolean;
}

@Component({
    selector: 'app-stock',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
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
        </nav>
        <button class="logout" (click)="logout()">Logout</button>
      </aside>
      <main class="content">
        <header class="header">
          <h2>Stock Management</h2>
          <button class="refresh-btn" (click)="loadStock()">↻ Refresh</button>
        </header>

        <!-- Alerts Section -->
        <section class="card alerts-card" *ngIf="alerts.length > 0">
          <h3 class="section-title">⚠️ Stock Alerts</h3>
          <div class="alert-grid">
            <div *ngFor="let alert of alerts" class="alert-item" 
                 [class.expiry-alert]="alert.isNearExpiry"
                 [class.stock-alert]="alert.isLowStock && !alert.isNearExpiry">
              <div class="alert-header">
                <strong>{{ alert.medicineName }}</strong>
                <span class="badge" *ngIf="alert.isNearExpiry">Near Expiry</span>
                <span class="badge" *ngIf="alert.isLowStock">Low Stock</span>
              </div>
              <div class="alert-details">
                <span>Batch: {{ alert.batchNumber }}</span>
                <span>Qty: {{ alert.availableQuantity }}</span>
                <span>Expires: {{ alert.expiryDate }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Current Stock Section -->
        <section class="card">
          <div class="table-header">
            <h3 class="section-title">Current Stock</h3>
            <input 
              type="text" 
              placeholder="Search medicines..." 
              [(ngModel)]="searchTerm"
              class="search-input"
              (input)="filterStock()"
            />
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Branch</th>
                  <th>Batch</th>
                  <th>Expiry Date</th>
                  <th>Available Qty</th>
                  <th>Purchase Price</th>
                  <th>Sale Price</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of filteredStock" 
                    [class.near-expiry]="isNearExpiry(item.expiryDate)"
                    [class.low-stock]="item.availableQuantity <= 10">
                  <td><strong>{{ item.medicineName }}</strong></td>
                  <td>{{ item.branchName }}</td>
                  <td>{{ item.batchNumber }}</td>
                  <td>{{ item.expiryDate }}</td>
                  <td>
                    <span class="qty-badge" [class.low]="item.availableQuantity <= 10">
                      {{ item.availableQuantity }}
                    </span>
                  </td>
                  <td>₹{{ item.purchasePrice.toFixed(2) }}</td>
                  <td>₹{{ item.salePrice.toFixed(2) }}</td>
                </tr>
                <tr *ngIf="filteredStock.length === 0">
                  <td colspan="7" class="no-data">No stock items found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `,
    styles: [`
    .layout {
      min-height: 100vh;
      display: flex;
      background: radial-gradient(circle at top left, #0ea5e9 0, #0f172a 40%, #020617 100%);
      color: #0f172a;
    }
    .sidebar {
      width: 240px;
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(8px);
      color: #e2e8f0;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(148, 163, 184, 0.3);
    }
    .logo {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 24px;
      letter-spacing: 0.05em;
    }
    nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    nav a {
      color: #cbd5f5;
      text-decoration: none;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
    }
    nav a::before {
      content: '●';
      font-size: 7px;
      color: #38bdf8;
    }
    nav a:hover {
      background: rgba(148, 163, 184, 0.14);
      transform: translateX(2px);
    }
    nav a.active {
      background: linear-gradient(to right, #0ea5e9, #22c55e);
      color: #0f172a;
    }
    nav a.active::before {
      color: #0f172a;
    }
    .logout {
      margin-top: 16px;
      padding: 8px 10px;
      border-radius: 999px;
      border: 1px solid rgba(248, 113, 113, 0.45);
      background: rgba(15, 23, 42, 0.6);
      color: #fecaca;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .logout:hover {
      background: #ef4444;
      border-color: #fecaca;
      color: white;
    }
    .content {
      flex: 1;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h2 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .refresh-btn {
      padding: 8px 16px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(to right, #0f766e, #0ea5e9);
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.15s ease;
    }
    .refresh-btn:hover {
      transform: scale(1.05);
    }
    .card {
      background: rgba(248, 250, 252, 0.98);
      border-radius: 16px;
      padding: 18px 20px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .alerts-card {
      background: linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(254, 226, 226, 0.95));
      border-color: rgba(251, 191, 36, 0.5);
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 14px;
      color: #0f172a;
    }
    .alert-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
    .alert-item {
      background: white;
      padding: 12px;
      border-radius: 10px;
      border-left: 4px solid #f59e0b;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .alert-item.expiry-alert {
      border-left-color: #ef4444;
    }
    .alert-item.stock-alert {
      border-left-color: #f59e0b;
    }
    .alert-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
      background: #ef4444;
      color: white;
      font-weight: 600;
    }
    .alert-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      color: #64748b;
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .search-input {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
      width: 250px;
    }
    .search-input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.3);
    }
    .table-wrapper {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #0f172a;
    }
    tr:nth-child(even) td {
      background-color: #f9fafb;
    }
    tr.near-expiry {
      background-color: rgba(254, 226, 226, 0.5) !important;
    }
    tr.low-stock {
      background-color: rgba(254, 243, 199, 0.5) !important;
    }
    .qty-badge {
      padding: 4px 10px;
      border-radius: 999px;
      background: #22c55e;
      color: white;
      font-weight: 600;
      font-size: 13px;
    }
    .qty-badge.low {
      background: #f59e0b;
    }
    .no-data {
      text-align: center;
      color: #94a3b8;
      padding: 24px !important;
    }
    @media (max-width: 768px) {
      .layout {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding-inline: 16px;
      }
      nav {
        flex-direction: row;
        gap: 4px;
      }
      nav a {
        padding-inline: 10px;
      }
      .logout {
        margin-top: 0;
        margin-left: 8px;
      }
      .content {
        padding: 16px;
      }
      .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .search-input {
        width: 100%;
      }
    }
  `],
})
export class StockComponent implements OnInit {
    stock: StockItem[] = [];
    filteredStock: StockItem[] = [];
    alerts: StockAlert[] = [];
    searchTerm: string = '';
    private readonly apiBaseUrl = 'http://localhost:5000/api';

    constructor(private http: HttpClient, private auth: AuthService) { }

    ngOnInit(): void {
        this.loadStock();
        this.loadAlerts();
    }

    logout(): void {
        this.auth.logout();
    }

    loadStock(): void {
        this.http
            .get<StockItem[]>(`${this.apiBaseUrl}/stock/current`)
            .subscribe((res) => {
                this.stock = res;
                this.filterStock();
            });
    }

    loadAlerts(): void {
        this.http
            .get<StockAlert[]>(`${this.apiBaseUrl}/stock/alerts`)
            .subscribe((res) => (this.alerts = res));
    }

    filterStock(): void {
        if (!this.searchTerm.trim()) {
            this.filteredStock = this.stock;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredStock = this.stock.filter(
                (item) =>
                    item.medicineName.toLowerCase().includes(term) ||
                    item.batchNumber.toLowerCase().includes(term)
            );
        }
    }

    isNearExpiry(expiryDate: string): boolean {
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.floor(
            (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 30;
    }
}
