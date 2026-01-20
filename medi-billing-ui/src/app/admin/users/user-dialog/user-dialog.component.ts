import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { UserDto, Role } from '../../../models/user.model';
import { Branch } from '../../../models/branch.model';
import { UserService } from '../../../services/user.service';
import { BranchService } from '../../../services/branch.service';

@Component({
    selector: 'app-user-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    template: `
    <h2 mat-dialog-title>{{data ? 'Edit User' : 'Register User'}}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" [readonly]="!!data">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width" *ngIf="!data">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="fullName">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Branch</mat-label>
          <mat-select formControlName="branchId">
            <mat-option *ngFor="let b of branches" [value]="b.id">{{b.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Roles</mat-label>
          <mat-select formControlName="roleIds" multiple>
            <mat-option *ngFor="let r of roles" [value]="r.id">{{r.name}}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="userForm.invalid" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .full-width { width: 100%; margin-bottom: 10px; }
  `]
})
export class UserDialogComponent implements OnInit {
    userForm: FormGroup;
    branches: Branch[] = [];
    roles: Role[] = [];

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private branchService: BranchService,
        public dialogRef: MatDialogRef<UserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UserDto | null
    ) {
        this.userForm = this.fb.group({
            username: [data?.username || '', Validators.required],
            password: ['', data ? [] : [Validators.required]],
            fullName: [data?.fullName || '', Validators.required],
            email: [data?.email || '', [Validators.required, Validators.email]],
            branchId: [data?.branchId || '', Validators.required],
            roleIds: [[], Validators.required],
            isActive: [data?.isActive ?? true]
        });
    }

    ngOnInit(): void {
        this.branchService.getAll().subscribe(b => this.branches = b);
        this.userService.getRoles().subscribe(r => {
            this.roles = r;
            if (this.data) {
                // Map role names back to IDs if necessary, or simplify assignment
                const selectedRoleIds = this.roles
                    .filter(role => this.data?.roles.includes(role.name))
                    .map(role => role.id);
                this.userForm.get('roleIds')?.setValue(selectedRoleIds);
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        if (this.userForm.valid) {
            this.dialogRef.close(this.userForm.value);
        }
    }
}
