import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { UserDto } from '../../models/user.model';
import { UserDialogComponent } from './user-dialog/user-dialog.component';



@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
    template: `
    <div class="users-container">
      <div class="header">
        <h1>User Management</h1>
        <button mat-raised-button color="primary" (click)="registerUser()">
          <mat-icon>person_add</mat-icon> Register User
        </button>
      </div>

      <table mat-table [dataSource]="users" class="mat-elevation-z8">
        <ng-container matColumnDef="username">
          <th mat-header-cell *matHeaderCellDef> Username </th>
          <td mat-cell *matCellDef="let element"> {{element.username}} </td>
        </ng-container>

        <ng-container matColumnDef="fullName">
          <th mat-header-cell *matHeaderCellDef> Full Name </th>
          <td mat-cell *matCellDef="let element"> {{element.fullName}} </td>
        </ng-container>

        <ng-container matColumnDef="branch">
          <th mat-header-cell *matHeaderCellDef> Branch </th>
          <td mat-cell *matCellDef="let element"> {{element.branchName}} </td>
        </ng-container>

        <ng-container matColumnDef="roles">
          <th mat-header-cell *matHeaderCellDef> Roles </th>
          <td mat-cell *matCellDef="let element"> {{element.roles.join(', ')}} </td>
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
            <button mat-icon-button color="primary" (click)="editUser(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteUser(element)">
              <mat-icon>block</mat-icon>
            </button>
          </td>
        </ng-container>


        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
    styles: [`
    .users-container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    table { width: 100%; }
    .active { color: green; font-weight: bold; }
    .inactive { color: red; }
  `]
})
export class UsersComponent implements OnInit {
    users: UserDto[] = [];
    displayedColumns: string[] = ['username', 'fullName', 'branch', 'roles', 'status', 'actions'];

    constructor(private userService: UserService, private dialog: MatDialog) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.userService.getAll().subscribe(data => this.users = data);
    }

    registerUser(): void {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '500px',
            data: null
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.userService.create(result).subscribe(() => this.loadUsers());
            }
        });
    }

    editUser(user: UserDto): void {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '500px',
            data: user
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.userService.update(user.id, result).subscribe(() => this.loadUsers());
            }
        });
    }

    deleteUser(user: UserDto): void {
        if (confirm(`Are you sure you want to deactivate ${user.username}?`)) {
            this.userService.delete(user.id).subscribe(() => this.loadUsers());
        }
    }
}
