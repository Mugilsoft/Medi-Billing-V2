import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';

interface CartItem {
  stockBatchId: number;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  lineTotal: number;
  availableQuantity: number;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <h1 class="logo">MediBilling</h1>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
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
          <h2>Sales / New Bill</h2>
        </header>

        <div class="sales-container">
          <!-- Left side: Form -->
          <div class="sale-form card">
            <h3 class="section-title">Add Items</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Select Medicine (from Stock)</label>
                <select [(ngModel)]="selectedBatchId" (change)="onBatchSelect()" class="form-control">
                  <option [ngValue]="null">-- Select Medicine --</option>
                  <option *ngFor="let b of stock" [ngValue]="b.id">
                    {{b.medicineName}} (Batch: {{b.batchNumber}}) - Qty: {{b.availableQuantity}} - ₹{{b.salePrice}}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Quantity</label>
                <input type="number" [(ngModel)]="quantity" min="1" class="form-control" placeholder="Qty">
              </div>
              <div class="form-group d-flex align-end">
                <button (click)="addToCart()" class="btn-add" [disabled]="!selectedBatchId || quantity <= 0">Add to Bill</button>
              </div>
            </div>
          </div>

          <!-- Right side: Cart / Invoice -->
          <div class="sale-bill card">
            <h3 class="section-title">Current Bill</h3>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>GST%</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of cart; let i = index">
                    <td>
                      <strong>{{item.medicineName}}</strong><br>
                      <small>Batch: {{item.batchNumber}}</small>
                    </td>
                    <td>{{item.quantity}}</td>
                    <td>₹{{item.unitPrice.toFixed(2)}}</td>
                    <td>{{item.gstPercentage}}%</td>
                    <td>₹{{item.lineTotal.toFixed(2)}}</td>
                    <td><button (click)="removeFromCart(i)" class="btn-remove">×</button></td>
                  </tr>
                  <tr *ngIf="cart.length === 0">
                    <td colspan="6" class="no-data">No items added yet</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="bill-summary" *ngIf="cart.length > 0">
              <div class="summary-row">
                <span>Sub-total:</span>
                <span>₹{{subTotal.toFixed(2)}}</span>
              </div>
              <div class="summary-row">
                <span>GST:</span>
                <span>₹{{gstTotal.toFixed(2)}}</span>
              </div>
              <div class="summary-row total">
                <span>Grand Total:</span>
                <span>₹{{grandTotal.toFixed(2)}}</span>
              </div>
              <button (click)="submitSale()" class="btn-submit" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Processing...' : 'Complete Sale & Generate Invoice' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Receipt Modal (Overlay) -->
        <div class="modal-overlay" *ngIf="lastInvoice">
            <div class="modal-content invoice-print" id="printable-invoice">
                <div class="invoice-header">
                    <h2>MediBilling Receipt</h2>
                    <p>Invoice #: {{lastInvoice.invoiceNumber}}</p>
                    <p>Date: {{lastInvoice.invoiceDate | date:'medium'}}</p>
                </div>
                <hr>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let item of lastInvoice.items">
                            <td>{{item.stockBatch?.medicine?.name}}</td>
                            <td>{{item.quantity}}</td>
                            <td>₹{{item.unitPrice.toFixed(2)}}</td>
                            <td>₹{{item.lineTotal.toFixed(2)}}</td>
                        </tr>
                    </tbody>
                </table>
                <hr>
                <div class="print-summary">
                    <p>Sub-total: ₹{{lastInvoice.subTotal.toFixed(2)}}</p>
                    <p>GST: ₹{{lastInvoice.gstAmount.toFixed(2)}}</p>
                    <h3>Total: ₹{{lastInvoice.totalAmount.toFixed(2)}}</h3>
                </div>
                <div class="modal-actions no-print">
                    <button (click)="printInvoice()" class="btn-print">Print</button>
                    <button (click)="lastInvoice = null" class="btn-close">Close</button>
                </div>
            </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .sales-container { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }
      .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; align-items: flex-end; }
      .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; }
      .form-control { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
      .btn-add { background: #0ea5e9; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; width: 100%; }
      .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
      
      .sale-bill { min-height: 400px; display: flex; flex-direction: column; }
      .table-wrapper { flex-grow: 1; }
      .btn-remove { background: #ef4444; color: white; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; }

      .bill-summary { margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px; }
      .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b; font-weight: 500; }
      .summary-row.total { font-size: 20px; color: #0f172a; font-weight: 800; border-top: 1px dashed #e2e8f0; padding-top: 8px; margin-top: 8px; }

      .btn-submit { background: #22c55e; color: white; width: 100%; padding: 14px; border-radius: 8px; border: none; font-size: 16px; font-weight: 700; margin-top: 16px; cursor: pointer; }
      
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(90, 135, 150, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
      .modal-content { background: white; padding: 32px; border-radius: 12px; width: 500px; max-height: 90vh; overflow-y: auto; }
      .invoice-header { text-align: center; margin-bottom: 20px; }
      .print-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      .print-table th, .print-table td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
      .print-summary { text-align: right; margin-top: 16px; }
      .modal-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
      .btn-print { background: #0ea5e9; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; }
      .btn-close { background: #94a3b8; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; }

      @media print {
        .no-print { display: none !important; }
        .modal-overlay { background: white; position: static; }
        .modal-content { width: 100%; box-shadow: none; border: none; padding: 0; }
        body * { visibility: hidden; }
        #printable-invoice, #printable-invoice * { visibility: visible; }
        #printable-invoice { position: absolute; left: 0; top: 0; }
      }


      .card {
        background: rgba(248, 250, 252, 0.98);
        border-radius: 16px;
        padding: 18px 20px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
        border: 1px solid rgba(148, 163, 184, 0.3);
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #0f172a;
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
        color: #0f172a;
      }
      th {
        background: #f8fafc;
        font-weight: 600;
        color: #0f172a;
      }
      .no-data {
        text-align: center;
        color: #94a3b8;
        padding: 24px !important;
      }
      .d-flex { display: flex; }
      .align-end { align-items: flex-end; }

    `
  ]
})
export class SalesComponent implements OnInit {
  stock: any[] = [];
  cart: CartItem[] = [];
  selectedBatchId: number | null = null;
  quantity: number = 1;
  isSubmitting = false;
  lastInvoice: any = null;

  private readonly apiBaseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
    this.loadStock();
  }

  loadStock(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/stock/current`)
      .subscribe(res => this.stock = res);
  }

  onBatchSelect(): void {
    if (this.selectedBatchId) {
      const batch = this.stock.find(b => b.id === this.selectedBatchId);
      if (batch) {
        this.quantity = 1;
      }
    }
  }

  addToCart(): void {
    if (!this.selectedBatchId) return;
    const batch = this.stock.find(b => b.id === this.selectedBatchId);
    if (!batch) return;

    if (this.quantity > batch.availableQuantity) {
      alert(`Only ${batch.availableQuantity} available in stock.`);
      return;
    }

    const existingIndex = this.cart.findIndex(i => i.stockBatchId === this.selectedBatchId);
    if (existingIndex > -1) {
      const newQty = this.cart[existingIndex].quantity + this.quantity;
      if (newQty > batch.availableQuantity) {
        alert(`Cannot add more. Total in cart would exceed stock.`);
        return;
      }
      this.cart[existingIndex].quantity = newQty;
      this.cart[existingIndex].lineTotal = newQty * batch.salePrice * (1 + (batch.gstPercentage || 0) / 100);
    } else {
      const lineTotal = this.quantity * batch.salePrice;
      const gst = lineTotal * (batch.gstPercentage || 0) / 100;

      this.cart.push({
        stockBatchId: batch.id,
        medicineName: batch.medicineName,
        batchNumber: batch.batchNumber,
        quantity: this.quantity,
        unitPrice: batch.salePrice,
        gstPercentage: batch.gstPercentage || 0,
        lineTotal: lineTotal + gst,
        availableQuantity: batch.availableQuantity
      });
    }

    this.selectedBatchId = null;
    this.quantity = 1;
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  get subTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  get gstTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.gstPercentage / 100), 0);
  }

  get grandTotal(): number {
    return this.subTotal + this.gstTotal;
  }

  submitSale(): void {
    if (this.cart.length === 0) return;
    this.isSubmitting = true;

    const payload = {
      branchId: 1, // Defaulting to main branch for now
      items: this.cart.map(i => ({
        stockBatchId: i.stockBatchId,
        quantity: i.quantity
      }))
    };

    this.http.post<any>(`${this.apiBaseUrl}/sales`, payload)
      .subscribe({
        next: (res) => {
          this.lastInvoice = res;
          this.cart = [];
          this.isSubmitting = false;
          this.loadStock();
        },
        error: (err) => {
          alert('Error processing sale: ' + (err.error || err.message));
          this.isSubmitting = false;
        }
      });
  }

  printInvoice(): void {
    window.print();
  }

  logout(): void {
    this.auth.logout();
  }
}
