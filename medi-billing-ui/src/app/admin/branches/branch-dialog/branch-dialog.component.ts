import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Branch } from '../../../models/branch.model';

@Component({
    selector: 'app-branch-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    template: `
    <h2 mat-dialog-title>{{data ? 'Edit Branch' : 'Add Branch'}}</h2>
    <mat-dialog-content>
      <form [formGroup]="branchForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" placeholder="BR-001">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Branch Name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Address Line 1</mat-label>
          <input matInput formControlName="addressLine1">
        </mat-form-field>

        <div class="row">
           <mat-form-field appearance="outline" class="col">
            <mat-label>City</mat-label>
            <input matInput formControlName="city">
          </mat-form-field>
          <mat-form-field appearance="outline" class="col">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone">
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="branchForm.invalid" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .full-width { width: 100%; margin-bottom: 10px; }
    .row { display: flex; gap: 10px; }
    .col { flex: 1; }
  `]
})
export class BranchDialogComponent {
    branchForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<BranchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Branch | null
    ) {
        this.branchForm = this.fb.group({
            code: [data?.code || '', Validators.required],
            name: [data?.name || '', Validators.required],
            addressLine1: [data?.addressLine1 || ''],
            city: [data?.city || ''],
            phone: [data?.phone || ''],
            isActive: [data?.isActive ?? true]
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        if (this.branchForm.valid) {
            this.dialogRef.close(this.branchForm.value);
        }
    }
}
