import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-alert-dialog',
    template: `
        <h1 mat-dialog-title>{{ data.title }}</h1>
        <div mat-dialog-content [innerHTML]="data.message"></div>
        <div mat-dialog-actions>
            <mat-checkbox [(ngModel)]="isChecked">Do not show anymore</mat-checkbox>
            <button mat-button (click)="closeDialog()">
                {{ data.close }}
            </button>
        </div>
    `,
    standalone: true,
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        FormsModule,
        MatDialogActions,
        MatDialogTitle,
        MatDialogContent
    ]
})
export class AlertDialogComponent {
    isChecked = false;

    constructor(
        private dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string; close: string; title?: string }
    ) {}

    closeDialog() {
        this.dialogRef.close(this.isChecked);
    }
}
