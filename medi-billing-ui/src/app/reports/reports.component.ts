import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-reports',
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
          <h2>Reports</h2>
          <div class="report-tabs">
            <button [class.active]="activeTab === 'sales'" (click)="activeTab = 'sales'">Sales Report</button>
            <button [class.active]="activeTab === 'inventory'" (click)="activeTab = 'inventory'">Stock Report</button>
          </div>
        </header>

        <section class="card filters" *ngIf="activeTab === 'sales'">
          <div class="filter-row">
            <div class="filter-group">
              <label>Start Date</label>
              <input type="date" [(ngModel)]="salesFilters.startDate" />
            </div>
            <div class="filter-group">
              <label>End Date</label>
              <input type="date" [(ngModel)]="salesFilters.endDate" />
            </div>
            <button class="btn-primary" (click)="loadSalesReport()">Generate Report</button>
          </div>
        </section>

        <section class="card report-content">
          <div class="report-header" *ngIf="activeTab === 'inventory'">
             <h3 class="section-title">Stock Status Report</h3>
          </div>
          <div class="table-wrapper" *ngIf="activeTab === 'sales'">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Branch</th>
                  <th>Subtotal</th>
                  <th>GST</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of salesData">
                  <td><strong>{{s.invoiceNumber}}</strong></td>
                  <td>{{s.invoiceDate | date: 'dd/MM/yyyy'}}</td>
                  <td>{{s.patientName}}</td>
                  <td>{{s.branchName}}</td>
                  <td>₹{{s.subTotal.toFixed(2)}}</td>
                  <td>₹{{s.gstAmount.toFixed(2)}}</td>
                  <td><strong>₹{{s.totalAmount.toFixed(2)}}</strong></td>
                </tr>
                <tr *ngIf="!salesData.length">
                  <td colspan="7" class="no-data">No data found for the selected period</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-wrapper" *ngIf="activeTab === 'inventory'">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Qty</th>
                  <th>Pur. Price</th>
                  <th>Sale Price</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let i of inventoryData">
                  <td><strong>{{i.medicineName}}</strong></td>
                  <td>{{i.batchNumber}}</td>
                  <td>{{i.expiryDate | date: 'dd/MM/yyyy'}}</td>
                  <td>{{i.availableQuantity}}</td>
                  <td>₹{{i.purchasePrice.toFixed(2)}}</td>
                  <td>₹{{i.salePrice.toFixed(2)}}</td>
                  <td><strong>₹{{i.stockValue.toFixed(2)}}</strong></td>
                </tr>
                <tr *ngIf="!inventoryData.length">
                  <td colspan="7" class="no-data">No inventory data available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .header h2 { font-size: 26px; font-weight: 700; color: #f3f5f9; }
    .report-tabs { display: flex; gap: 12px; }
    .report-tabs button {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: white;
      cursor: pointer;
      font-weight: 600;
    }
    .report-tabs button.active {
      background: #0ea5e9;
      color: white;
      border-color: #0ea5e9;
    }

    .filters { margin-bottom: 20px; padding: 16px; }
    .filter-row { display: flex; align-items: flex-end; gap: 16px; }
    .filter-group { display: flex; flex-direction: column; gap: 4px; }
    .filter-group label { font-size: 13px; font-weight: 600; color: #475569; }
    .filter-group input { padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; }

    .card {
      background: rgba(248, 250, 252, 0.98);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .btn-primary {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      background: #0ea5e9;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
    .no-data { text-align: center; color: #94a3b8; padding: 30px !important; }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab: 'sales' | 'inventory' = 'sales';
  salesData: any[] = [];
  inventoryData: any[] = [];
  salesFilters = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  };
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadSalesReport();
    this.loadInventoryReport();
  }

  loadSalesReport(): void {
    const params = `?startDate=${this.salesFilters.startDate}&endDate=${this.salesFilters.endDate}`;
    this.http.get<any[]>(`${this.apiBaseUrl}/reports/sales${params}`)
      .subscribe(res => this.salesData = res);
  }

  loadInventoryReport(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/reports/inventory`)
      .subscribe(res => this.inventoryData = res);
  }

  logout(): void {
    this.auth.logout();
  }
}
