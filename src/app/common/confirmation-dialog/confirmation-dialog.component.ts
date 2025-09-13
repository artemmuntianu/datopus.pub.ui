import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: 'confirmation-dialog.component.html',
    standalone: true,
    imports: [MatButtonModule, MatDialogActions, MatDialogTitle, MatDialogContent]
})
export class ConfirmDialogComponent {
    title?: string;
    message?: string;

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel
    ) {
        this.title = data.title;
        this.message = data.message;
    }

    public confirmMessage: string;

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onDismiss(): void {
        this.dialogRef.close(false);
    }
}

export class ConfirmDialogModel {
    constructor(
        public title?: string,
        public message?: string
    ) {}
}
