import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { StockComponent } from './stock/stock.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { MedicinesComponent } from './medicines/medicines.component';
import { ReportsComponent } from './reports/reports.component';
import { SalesComponent } from './sales/sales.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';

import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { UsersComponent } from './admin/users/users.component';
import { BranchesComponent } from './admin/branches/branches.component';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'sales', component: SalesComponent },
      { path: 'stock', component: StockComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'medicines', component: MedicinesComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'reports', component: ReportsComponent },
      {
        path: 'admin',
        canActivate: [adminGuard],
        component: AdminLayoutComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: 'users', component: UsersComponent },
          { path: 'branches', component: BranchesComponent },
        ]
      }

    ],
  },

  { path: '**', redirectTo: '' },
];
