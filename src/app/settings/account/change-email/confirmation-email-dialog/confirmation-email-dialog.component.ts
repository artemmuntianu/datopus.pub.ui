import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from '@angular/material/dialog';

export interface ConfirmationEmailDialogData { oldEmail: string; newEmail: string }

@Component({
    selector: 'app-confirmation-email-dialog',
    templateUrl: './confirmation-email-dialog.component.html',
    styleUrls: ['./confirmation-email-dialog.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogClose,
        MatDialogActions,
    ],
})
export class ConfirmationEmailDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: ConfirmationEmailDialogData
    ) {}
}
