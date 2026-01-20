import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Supplier {
    id: number;
    name: string;
}

interface Medicine {
    id: number;
    code: string;
    name: string;
    gstPercentage: number;
}

interface Branch {
    id: number;
    name: string;
}

interface PurchaseItem {
    medicineId: number;
    medicineName?: string;
    batchNumber: string;
    manufactureDate?: string;
    expiryDate: string;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
    gstPercentage: number;
    lineTotal?: number;
}

interface Purchase {
    id: number;
    invoiceNumber: string;
    invoiceDate: string;
    supplier?: { name: string };
    branch?: { name: string };
    subTotal: number;
    gstAmount: number;
    totalAmount: number;
    items?: PurchaseItem[];
}

@Component({
    selector: 'app-purchases',
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
          <h2>Purchases</h2>
          <button class="btn-toggle" (click)="showForm = !showForm">
            {{ showForm ? '📋 View History' : '➕ New Purchase' }}
          </button>
        </header>

        <!-- Create Purchase Form -->
        <section class="card" *ngIf="showForm">
          <h3 class="section-title">Create Purchase</h3>
          <form (ngSubmit)="createPurchase()">
            <div class="form-row">
              <div class="form-group">
                <label>Invoice Number *</label>
                <input type="text" [(ngModel)]="newPurchase.invoiceNumber" name="invoiceNumber" required />
              </div>
              <div class="form-group">
                <label>Invoice Date *</label>
                <input type="date" [(ngModel)]="newPurchase.invoiceDate" name="invoiceDate" required />
              </div>
              <div class="form-group">
                <label>Supplier *</label>
                <select [(ngModel)]="newPurchase.supplierId" name="supplierId" required>
                  <option [value]="0">Select Supplier</option>
                  <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Branch *</label>
                <select [(ngModel)]="newPurchase.branchId" name="branchId" required>
                  <option [value]="0">Select Branch</option>
                  <option *ngFor="let b of branches" [value]="b.id">{{ b.name }}</option>
                </select>
              </div>
            </div>

            <div class="items-section">
              <div class="items-header">
                <h4>Items</h4>
                <button type="button" class="btn-add-item" (click)="addItem()">+ Add Item</button>
              </div>

              <div class="items-table">
                <div class="item-row header-row">
                  <div>Medicine</div>
                  <div>Batch</div>
                  <div>Mfg Date</div>
                  <div>Expiry</div>
                  <div>Qty</div>
                  <div>Pur. Price</div>
                  <div>Sale Price</div>
                  <div>GST %</div>
                  <div>Total</div>
                  <div></div>
                </div>

                <div class="item-row" *ngFor="let item of newPurchase.items; let i = index">
                  <select [(ngModel)]="item.medicineId" [name]="'med_' + i" (change)="onMedicineChange(item)" required>
                    <option [value]="0">Select</option>
                    <option *ngFor="let m of medicines" [value]="m.id">{{ m.name }}</option>
                  </select>
                  <input type="text" [(ngModel)]="item.batchNumber" [name]="'batch_' + i" placeholder="Batch" required />
                  <input type="date" [(ngModel)]="item.manufactureDate" [name]="'mfg_' + i" />
                  <input type="date" [(ngModel)]="item.expiryDate" [name]="'exp_' + i" required />
                  <input type="number" [(ngModel)]="item.quantity" [name]="'qty_' + i" min="1" (input)="calculateItemTotal(item)" required />
                  <input type="number" [(ngModel)]="item.purchasePrice" [name]="'pp_' + i" step="0.01" (input)="calculateItemTotal(item)" required />
                  <input type="number" [(ngModel)]="item.salePrice" [name]="'sp_' + i" step="0.01" required />
                  <input type="number" [(ngModel)]="item.gstPercentage" [name]="'gst_' + i" step="0.01" (input)="calculateItemTotal(item)" required />
                  <div class="total-display">₹{{ item.lineTotal?.toFixed(2) || '0.00' }}</div>
                  <button type="button" class="btn-remove" (click)="removeItem(i)">×</button>
                </div>
              </div>
            </div>

            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <strong>₹{{ calculateSubtotal().toFixed(2) }}</strong>
              </div>
              <div class="total-row">
                <span>GST:</span>
                <strong>₹{{ calculateGST().toFixed(2) }}</strong>
              </div>
              <div class="total-row grand-total">
                <span>Grand Total:</span>
                <strong>₹{{ calculateGrandTotal().toFixed(2) }}</strong>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="newPurchase.items.length === 0">
                Create Purchase
              </button>
              <button type="button" class="btn-secondary" (click)="resetForm()">Cancel</button>
            </div>
          </form>
        </section>

        <!-- Purchase History -->
        <section class="card" *ngIf="!showForm">
          <h3 class="section-title">Purchase History</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Branch</th>
                  <th>Subtotal</th>
                  <th>GST</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of purchases">
                  <td><strong>{{ p.invoiceNumber }}</strong></td>
                  <td>{{ p.invoiceDate | date: 'dd/MM/yyyy' }}</td>
                  <td>{{ p.supplier?.name || '-' }}</td>
                  <td>{{ p.branch?.name || '-' }}</td>
                  <td>₹{{ p.subTotal.toFixed(2) }}</td>
                  <td>₹{{ p.gstAmount.toFixed(2) }}</td>
                  <td><strong>₹{{ p.totalAmount.toFixed(2) }}</strong></td>
                </tr>
                <tr *ngIf="purchases.length === 0">
                  <td colspan="7" class="no-data">No purchases found</td>
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
    }
    .header h2 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .btn-toggle {
      padding: 8px 16px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(to right, #0f766e, #0ea5e9);
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }
    .card {
      background: rgba(248, 250, 252, 0.98);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }
    .form-group input, .form-group select {
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.3);
    }
    .items-section {
      margin-bottom: 20px;
    }
    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .items-header h4 {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    .btn-add-item {
      padding: 6px 12px;
      border-radius: 999px;
      border: none;
      background: #22c55e;
      color: white;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }
    .items-table {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-row {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1fr 1fr 0.7fr 0.8fr 0.8fr 0.6fr 1fr 28px;
      gap: 4px;
      align-items: center;
    }
    .item-row.header-row {
      font-weight: 600;
      font-size: 11px;
      color: #475569;
      padding-bottom: 4px;
      border-bottom: 2px solid #e2e8f0;
    }
    .item-row input, .item-row select {
      padding: 2px 4px;
      height: 26px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      font-size: 11px;
      width: 100%;
    }
    .item-row input:focus, .item-row select:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .total-display {
      font-weight: 600;
      color: #0f766e;
      font-size: 12px;
    }
    .btn-remove {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: none;
      background: #ef4444;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .totals-section {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 15px;
    }
    .total-row.grand-total {
      border-top: 2px solid #cbd5e1;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      color: #0f766e;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }
    .btn-primary {
      background: linear-gradient(to right, #0f766e, #0ea5e9);
      color: white;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #e2e8f0;
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
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #0f172a;
    }
    tr:nth-child(even) td {
      background-color: #f9fafb;
    }
    .no-data {
      text-align: center;
      color: #94a3b8;
      padding: 24px !important;
    }
    @media (max-width: 1200px) {
      .item-row {
        grid-template-columns: 1fr;
      }
      .item-row.header-row {
        display: none;
      }
    }
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PurchasesComponent implements OnInit {
    purchases: Purchase[] = [];
    suppliers: Supplier[] = [];
    medicines: Medicine[] = [];
    branches: Branch[] = [];
    showForm = false;
    newPurchase: {
        invoiceNumber: string;
        invoiceDate: string;
        supplierId: number;
        branchId: number;
        items: PurchaseItem[];
    } = this.getEmptyPurchase();
    private readonly apiBaseUrl = 'http://localhost:5000/api';

    constructor(private http: HttpClient, private auth: AuthService) { }

    ngOnInit(): void {
        this.loadPurchases();
        this.loadSuppliers();
        this.loadMedicines();
        this.loadBranches();
    }

    logout(): void {
        this.auth.logout();
    }

    getEmptyPurchase() {
        return {
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            supplierId: 0,
            branchId: 0,
            items: [] as PurchaseItem[],
        };
    }

    getEmptyItem(): PurchaseItem {
        return {
            medicineId: 0,
            batchNumber: '',
            expiryDate: '',
            quantity: 1,
            purchasePrice: 0,
            salePrice: 0,
            gstPercentage: 0,
            lineTotal: 0,
        };
    }

    loadPurchases(): void {
        this.http
            .get<Purchase[]>(`${this.apiBaseUrl}/purchases`)
            .subscribe((res) => (this.purchases = res));
    }

    loadSuppliers(): void {
        this.http
            .get<Supplier[]>(`${this.apiBaseUrl}/suppliers`)
            .subscribe((res) => (this.suppliers = res));
    }

    loadMedicines(): void {
        this.http
            .get<Medicine[]>(`${this.apiBaseUrl}/medicines`)
            .subscribe((res) => (this.medicines = res));
    }

    loadBranches(): void {
        this.http
            .get<Branch[]>(`${this.apiBaseUrl}/branches`)
            .subscribe((res) => (this.branches = res));
    }

    addItem(): void {
        this.newPurchase.items.push(this.getEmptyItem());
    }

    removeItem(index: number): void {
        this.newPurchase.items.splice(index, 1);
    }

    onMedicineChange(item: PurchaseItem): void {
        const medicine = this.medicines.find((m) => m.id === item.medicineId);
        if (medicine) {
            item.gstPercentage = medicine.gstPercentage;
            this.calculateItemTotal(item);
        }
    }

    calculateItemTotal(item: PurchaseItem): void {
        const base = item.quantity * item.purchasePrice;
        const gst = base * (item.gstPercentage / 100);
        item.lineTotal = base + gst;
    }

    calculateSubtotal(): number {
        return this.newPurchase.items.reduce(
            (sum, item) => sum + item.quantity * item.purchasePrice,
            0
        );
    }

    calculateGST(): number {
        return this.newPurchase.items.reduce((sum, item) => {
            const base = item.quantity * item.purchasePrice;
            return sum + base * (item.gstPercentage / 100);
        }, 0);
    }

    calculateGrandTotal(): number {
        return this.calculateSubtotal() + this.calculateGST();
    }

    createPurchase(): void {
        if (this.newPurchase.items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        const request = {
            invoiceNumber: this.newPurchase.invoiceNumber,
            invoiceDate: new Date(this.newPurchase.invoiceDate).toISOString(),
            supplierId: this.newPurchase.supplierId,
            branchId: this.newPurchase.branchId,
            items: this.newPurchase.items.map((item) => ({
                medicineId: item.medicineId,
                batchNumber: item.batchNumber,
                manufactureDate: item.manufactureDate || null,
                expiryDate: item.expiryDate,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                salePrice: item.salePrice,
                gstPercentage: item.gstPercentage,
            })),
        };

        this.http.post(`${this.apiBaseUrl}/purchases`, request).subscribe(() => {
            this.loadPurchases();
            this.resetForm();
            this.showForm = false;
            alert('Purchase created successfully!');
        });
    }

    resetForm(): void {
        this.newPurchase = this.getEmptyPurchase();
    }
}
