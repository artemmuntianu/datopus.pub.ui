import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-plan-builder',
    templateUrl: './plan-explainer-dialog.component.html',
    styleUrl: './plan-explainer-dialog.component.scss',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule]
})
export class PlanExpainerDialogComponent {
    constructor(public dialogRef: MatDialogRef<PlanExpainerDialogComponent>) {}

    onNoClick() {
        this.dialogRef.close();
    }
}
