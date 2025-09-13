import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, Inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatDialogRef,
    MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Validators } from 'ngx-editor';

export interface DashboardDialogData {
    type: 'rename' | 'description' | 'create';
    title: string;
    description?: string;
    name?: string;
}

export interface NewTile {
    name: string;
    description?: string;
    visual: string;
    width: number;
    height: number;
}

@Component({
    selector: 'app-dashboard-dialog',
    templateUrl: 'dashboard-dialog.component.html',
    styleUrl: 'dashboard-dialog.component.scss',
    standalone: true,
    imports: [
        MatButtonModule,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatExpansionModule,
        MatSlideToggleModule,
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle,
        MatDialogContent,
        ReactiveFormsModule,
        MatCardModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardDialogComponent {
    readonly dialogRef = inject(MatDialogRef<DashboardDialogComponent>);

    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: DashboardDialogData
    ) {
        switch (data.type) {
            case 'create': {
                this.form = this.fb.group({
                    name: ['', Validators.required()],
                    description: ['']
                });
                break;
            }
            case 'description': {
                this.form = this.fb.group({
                    description: [data.description, Validators.required()]
                });
                break;
            }
            case 'rename': {
                this.form = this.fb.group({
                    name: [data.name, Validators.required()]
                });
                break;
            }
        }
    }

    onCancel() {
        this.dialogRef.close();
    }

    onSubmit() {
        this.dialogRef.close(this.form.value);
    }
}
