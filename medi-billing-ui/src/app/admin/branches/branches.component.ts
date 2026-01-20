import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../models/branch.model';
import { BranchDialogComponent } from './branch-dialog/branch-dialog.component';


@Component({
    selector: 'app-branches',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
    template: `
    <div class="branches-container">
      <div class="header">
        <h1>Branch Management</h1>
        <button mat-raised-button color="primary" (click)="addBranch()">
          <mat-icon>add</mat-icon> Add Branch
        </button>
      </div>

      <table mat-table [dataSource]="branches" class="mat-elevation-z8">
        <ng-container matColumnDef="code">
          <th mat-header-cell *matHeaderCellDef> Code </th>
          <td mat-cell *matCellDef="let element"> {{element.code}} </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let element"> {{element.name}} </td>
        </ng-container>

        <ng-container matColumnDef="city">
          <th mat-header-cell *matHeaderCellDef> City </th>
          <td mat-cell *matCellDef="let element"> {{element.city}} </td>
        </ng-container>

        <ng-container matColumnDef="phone">
          <th mat-header-cell *matHeaderCellDef> Phone </th>
          <td mat-cell *matCellDef="let element"> {{element.phone}} </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let element">
            <span [class.active]="element.isActive" [class.inactive]="!element.isActive">
              {{element.isActive ? 'Active' : 'Inactive'}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="primary" (click)="editBranch(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteBranch(element)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>


        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
    styles: [`
    .branches-container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    table { width: 100%; }
    .active { color: green; font-weight: bold; }
    .inactive { color: red; }
  `]
})
export class BranchesComponent implements OnInit {
    branches: Branch[] = [];
    displayedColumns: string[] = ['code', 'name', 'city', 'phone', 'status', 'actions'];

    constructor(private branchService: BranchService, private dialog: MatDialog) { }

    ngOnInit(): void {
        this.loadBranches();
    }

    loadBranches(): void {
        this.branchService.getAll().subscribe(data => this.branches = data);
    }

    addBranch(): void {
        const dialogRef = this.dialog.open(BranchDialogComponent, {
            width: '400px',
            data: null
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.branchService.create(result).subscribe(() => this.loadBranches());
            }
        });
    }

    editBranch(branch: Branch): void {
        const dialogRef = this.dialog.open(BranchDialogComponent, {
            width: '400px',
            data: branch
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.branchService.update(branch.id, { ...branch, ...result }).subscribe(() => this.loadBranches());
            }
        });
    }

    deleteBranch(branch: Branch): void {
        if (confirm(`Are you sure you want to deactivate ${branch.name}?`)) {
            this.branchService.delete(branch.id).subscribe(() => this.loadBranches());
        }
    }
}
