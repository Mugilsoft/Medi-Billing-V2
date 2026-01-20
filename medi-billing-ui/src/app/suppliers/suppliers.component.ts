import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Supplier {
  id: number;
  name: string;
  supplierCode?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-suppliers',
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
          <h2>Suppliers</h2>
        </header>

        <section class="card">
          <form class="form-inline" (ngSubmit)="saveSupplier()">
            <input
              type="text"
              placeholder="Name"
              [(ngModel)]="editSupplier.name"
              name="name"
              required
            />
            <input
              type="text"
              placeholder="Code"
              [(ngModel)]="editSupplier.supplierCode"
              name="supplierCode"
            />
            <input
              type="text"
              placeholder="Phone"
              [(ngModel)]="editSupplier.phone"
              name="phone"
            />
            <input
              type="text"
              placeholder="GST Number"
              [(ngModel)]="editSupplier.gstNumber"
              name="gstNumber"
            />
            <button type="submit">
              {{ editSupplier.id ? 'Update' : 'Add' }}
            </button>
            <button type="button" class="secondary" (click)="resetForm()">
              Clear
            </button>
          </form>
        </section>

        <section class="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Phone</th>
                <th>GST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of suppliers">
                <td>{{ s.name }}</td>
                <td>{{ s.supplierCode }}</td>
                <td>{{ s.phone }}</td>
                <td>{{ s.gstNumber }}</td>
                <td>
                  <button (click)="startEdit(s)">Edit</button>
                  <button class="danger" (click)="deleteSupplier(s)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
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
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
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
      .card {
        background: rgba(248, 250, 252, 0.98);
        border-radius: 16px;
        padding: 16px 18px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
        border: 1px solid rgba(148, 163, 184, 0.3);
      }
      .form-inline {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px;
        align-items: center;
      }
      .form-inline input {
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        font-size: 14px;
        background-color: #ffffff;
      }
      .form-inline input:focus {
        outline: none;
        border-color: #0ea5e9;
        box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.3);
      }
      .form-inline button {
        padding: 9px 10px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(to right, #0f766e, #0ea5e9);
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
      }
      .form-inline button.secondary {
        background: #e2e8f0;
        color: #0f172a;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      th,
      td {
        padding: 8px 10px;
        border-bottom: 1px solid #e2e8f0;
      }
      th {
        text-align: left;
        background: #f8fafc;
        font-weight: 600;
        color: #0f172a;
      }
      tr:nth-child(even) td {
        background-color: #f9fafb;
      }
      td button {
        margin-right: 6px;
        padding: 4px 9px;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        font-size: 12px;
      }
      td button:first-child {
        background: #0ea5e9;
        color: white;
      }
      td button.danger {
        background: #ef4444;
        color: white;
      }
      @media (max-width: 920px) {
        .form-inline {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
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
        .card {
          padding: 14px;
        }
      }
    `,
  ],
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  editSupplier: Supplier = {
    id: 0,
    name: '',
    isActive: true,
  };

  // TODO: adjust to match backend URL/port
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  logout(): void {
    this.auth.logout();
  }

  loadSuppliers(): void {
    this.http
      .get<Supplier[]>(`${this.apiBaseUrl}/suppliers`)
      .subscribe((res) => (this.suppliers = res));
  }

  startEdit(s: Supplier): void {
    this.editSupplier = { ...s };
  }

  resetForm(): void {
    this.editSupplier = {
      id: 0,
      name: '',
      isActive: true,
    };
  }

  saveSupplier(): void {
    if (this.editSupplier.id) {
      this.http
        .put(
          `${this.apiBaseUrl}/suppliers/${this.editSupplier.id}`,
          this.editSupplier
        )
        .subscribe(() => {
          this.loadSuppliers();
          this.resetForm();
        });
    } else {
      this.http
        .post<Supplier>(
          `${this.apiBaseUrl}/suppliers`,
          this.editSupplier
        )
        .subscribe(() => {
          this.loadSuppliers();
          this.resetForm();
        });
    }
  }

  deleteSupplier(s: Supplier): void {
    if (!confirm(`Delete supplier "${s.name}"?`)) {
      return;
    }
    this.http
      .delete(`${this.apiBaseUrl}/suppliers/${s.id}`)
      .subscribe(() => this.loadSuppliers());
  }
}

