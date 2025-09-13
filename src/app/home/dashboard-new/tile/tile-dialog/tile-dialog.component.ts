import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, computed, Inject } from '@angular/core';
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
import { VisualDefinition, Visuals } from '../../../reports/features/models/reports-definition';
import {
    REPORT_VISUALS
} from '../../../reports/consts/reports-default-configuration';
import { Validators } from 'ngx-editor';
import { ReportsStore } from '../../../../store/reports/reports.store';
import { DashboardStore } from '../../../../store/dashboard/dashboard.store';
import { DashboardService } from '../../../../store/dashboard/dashboard.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

export interface NewTile {
    name: string;
    description?: string;
    visual: string;
    width: number;
    height: number;
}

export interface TileDialogData {
    type: 'rename' | 'description' | 'create';
    title: string;
    description?: string;
    name?: string;
}

@Component({
    selector: 'app-tile-dialog',
    templateUrl: 'tile-dialog.component.html',
    styleUrl: 'tile-dialog.component.scss',
    standalone: true,
    imports: [
        MatButtonModule,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatExpansionModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle,
        MatDialogContent,
        ReactiveFormsModule,
        MatCardModule,
        MatIcon
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileDialogComponent {
    readonly dialogRef = inject(MatDialogRef<TileDialogComponent>);
    visuals = REPORT_VISUALS;
    dashboardStore = inject(DashboardStore);
    dashboardService = inject(DashboardService);

    reportsStore = inject(ReportsStore);
    router = inject(Router);
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: TileDialogData
    ) {
        switch (data.type) {
            case 'create': {
                this.form = this.fb.group({
                    name: ['', Validators.required()],
                    description: [''],
                    visual: [this.visuals.chart[0], (control: any) => (control.value ? null : { required: true })],
                    width: ['2', Validators.required()],
                    height: ['2', Validators.required()]
                });
                break;
            }
            case 'description': {
                this.form = this.fb.group({
                    description: [data.description ?? '']
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

    visualTypes = computed<(keyof Visuals)[]>(() => {
        return Object.keys(REPORT_VISUALS ?? {}) as (keyof Visuals)[];
    });

    compareVisuals(option1: VisualDefinition, option2: VisualDefinition): boolean {
        return option1 && option2
            ? option1.type === option2.type && option1.subtype === option2.subtype
            : option1 === option2;
    }
}
