import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Medicine {
  id: number;
  code: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  unit?: string;
  gstPercentage: number;
  isActive: boolean;
}

@Component({
  selector: 'app-medicines',
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
          <h2>Medicines</h2>
        </header>

        <section class="card">
          <form class="form-grid" (ngSubmit)="saveMedicine()">
            <input
              type="text"
              placeholder="Code *"
              [(ngModel)]="editMedicine.code"
              name="code"
              required
            />
            <input
              type="text"
              placeholder="Name *"
              [(ngModel)]="editMedicine.name"
              name="name"
              required
            />
            <input
              type="text"
              placeholder="Generic Name"
              [(ngModel)]="editMedicine.genericName"
              name="genericName"
            />
            <input
              type="text"
              placeholder="Manufacturer"
              [(ngModel)]="editMedicine.manufacturer"
              name="manufacturer"
            />
            <input
              type="text"
              placeholder="Unit (e.g., Tablet, Strip)"
              [(ngModel)]="editMedicine.unit"
              name="unit"
            />
            <input
              type="number"
              placeholder="GST %"
              [(ngModel)]="editMedicine.gstPercentage"
              name="gstPercentage"
              step="0.01"
            />
            <button type="submit" class="btn-primary">
              {{ editMedicine.id ? 'Update' : 'Add' }}
            </button>
            <button type="button" class="btn-secondary" (click)="resetForm()">
              Clear
            </button>
          </form>
        </section>

        <section class="card">
          <div class="table-header">
            <h3 class="section-title">All Medicines</h3>
            <input 
              type="text" 
              placeholder="Search..." 
              [(ngModel)]="searchTerm"
              class="search-input"
              (input)="filterMedicines()"
            />
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Generic Name</th>
                  <th>Manufacturer</th>
                  <th>Unit</th>
                  <th>GST %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of filteredMedicines">
                  <td><strong>{{ m.code }}</strong></td>
                  <td>{{ m.name }}</td>
                  <td>{{ m.genericName || '-' }}</td>
                  <td>{{ m.manufacturer || '-' }}</td>
                  <td>{{ m.unit || '-' }}</td>
                  <td>{{ m.gstPercentage }}%</td>
                  <td>
                    <button class="btn-edit" (click)="startEdit(m)">Edit</button>
                    <button class="btn-delete" (click)="deleteMedicine(m)">Delete</button>
                  </td>
                </tr>
                <tr *ngIf="filteredMedicines.length === 0">
                  <td colspan="7" class="no-data">No medicines found</td>
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
      transition: background 0.15s ease;
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
    .header h2 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .card {
      background: rgba(248, 250, 252, 0.98);
      border-radius: 16px;
      padding: 18px 20px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .form-grid input {
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
      background-color: #ffffff;
    }
    .form-grid input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.3);
    }
    .btn-primary, .btn-secondary {
      padding: 9px 12px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.15s ease;
    }
    .btn-primary {
      background: linear-gradient(to right, #0f766e, #0ea5e9);
      color: white;
    }
    .btn-secondary {
      background: #e2e8f0;
      color: #0f172a;
    }
    .btn-primary:hover, .btn-secondary:hover {
      transform: scale(1.02);
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
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
    .btn-edit, .btn-delete {
      margin-right: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: transform 0.15s ease;
    }
    .btn-edit {
      background: #0ea5e9;
      color: white;
    }
    .btn-delete {
      background: #ef4444;
      color: white;
    }
    .btn-edit:hover, .btn-delete:hover {
      transform: scale(1.05);
    }
    .no-data {
      text-align: center;
      color: #94a3b8;
      padding: 24px !important;
    }
    @media (max-width: 920px) {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
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
      }
      nav {
        flex-direction: row;
        gap: 4px;
      }
      .content {
        padding: 16px;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class MedicinesComponent implements OnInit {
  medicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];
  searchTerm: string = '';
  editMedicine: Medicine = this.getEmptyMedicine();
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
    this.loadMedicines();
  }

  logout(): void {
    this.auth.logout();
  }

  getEmptyMedicine(): Medicine {
    return {
      id: 0,
      code: '',
      name: '',
      gstPercentage: 0,
      isActive: true,
    };
  }

  loadMedicines(): void {
    console.log('Loading medicines from:', `${this.apiBaseUrl}/medicines`);
    this.http
      .get<Medicine[]>(`${this.apiBaseUrl}/medicines`)
      .subscribe({
        next: (res) => {
          console.log('Medicines loaded:', res);
          this.medicines = res;
          this.filterMedicines();
        },
        error: (err) => {
          console.error('Error loading medicines:', err);
          alert('Error loading medicines. Please check console.');
        }
      });
  }


  filterMedicines(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMedicines = this.medicines;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredMedicines = this.medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.code.toLowerCase().includes(term) ||
          (m.genericName && m.genericName.toLowerCase().includes(term))
      );
    }
  }

  startEdit(m: Medicine): void {
    this.editMedicine = { ...m };
  }

  resetForm(): void {
    this.editMedicine = this.getEmptyMedicine();
  }

  saveMedicine(): void {
    if (this.editMedicine.id) {
      this.http
        .put(`${this.apiBaseUrl}/medicines/${this.editMedicine.id}`, this.editMedicine)
        .subscribe(() => {
          this.loadMedicines();
          this.resetForm();
        });
    } else {
      this.http
        .post<Medicine>(`${this.apiBaseUrl}/medicines`, this.editMedicine)
        .subscribe(() => {
          this.loadMedicines();
          this.resetForm();
        });
    }
  }

  deleteMedicine(m: Medicine): void {
    if (!confirm(`Delete medicine "${m.name}"?`)) {
      return;
    }
    this.http
      .delete(`${this.apiBaseUrl}/medicines/${m.id}`)
      .subscribe(() => this.loadMedicines());
  }
}
