import { Component, inject, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { TileHeaderComponent } from './header/tile-header.component';
import { NgComponentOutlet } from '@angular/common';
import { Tile } from '../dashboard/dashboard.model';
import { MatDivider } from '@angular/material/divider';
import { DashboardStore } from '../../../store/dashboard/dashboard.store';
import { DatasourceStore } from '../../../store/datasource/datasource.store';
import { TileDialogComponent } from './tile-dialog/tile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
    ConfirmDialogModel,
    ConfirmDialogComponent
} from '../../../common/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tile',
    styleUrl: './tile.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TileHeaderComponent, NgComponentOutlet, MatDivider],
    template: `
        <div
            class="overflow-hidden border-radius position-relative tile-container"
            [style.background-color]="data().backgroundColor ?? 'white'"
            [style.color]="data().color ?? 'inherit'"
            [style.boxSizing]="'border-box'"
        >
            <app-tile-header
                [data]="data()"
                (changeTileDescription)="changeDescription()"
                (editTile)="editTile()"
                (removeTile)="remove()"
                (rename)="rename()"
            />
            <mat-divider></mat-divider>

            <ng-container
                [ngComponentOutlet]="data().content"
                [ngComponentOutletInputs]="inputs()"
            />
        </div>
    `
})
export class TileComponent {
    data = input.required<Tile>();
    router = inject(Router);
    dashboardStore = inject(DashboardStore);
    datasourceStore = inject(DatasourceStore);
    dialog = inject(MatDialog);

    inputs = computed(() => {
        return {
            datasource: this.datasourceStore.bqDatasource(),
            ...this.data().inputs
        };
    });

    changeDescription() {
        const dialogRef = this.dialog.open(TileDialogComponent, {
            width: '600px',
            data: {
                type: 'description',
                title: 'Tile description',
                description: this.data()?.description
            },
            backdropClass: 'dashboard-dialog-backdrop',
            exitAnimationDuration: '200ms',
            enterAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const { description } = result;
                this.dashboardStore.updateTileWithSave(this.data().id, { description });
            }
        });
    }

    rename() {
        const dialogRef = this.dialog.open(TileDialogComponent, {
            width: '600px',
            data: {
                type: 'rename',
                title: 'Tile name',
                name: this.data()?.name
            },
            backdropClass: 'dashboard-dialog-backdrop',
            exitAnimationDuration: '200ms',
            enterAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const { name } = result;
                this.dashboardStore.updateTileWithSave(this.data().id, { name });
            }
        });
    }

    remove() {
        const dialogData = new ConfirmDialogModel('Confirm tile removal');

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '600px',
            data: dialogData,
            backdropClass: 'dashboard-dialog-backdrop',
            exitAnimationDuration: '200ms',
            enterAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
            if (confirmed) {
                await this.dashboardStore.deleteTile(this.data().id);
            }
        });
    }

    editTile() {
        const definition = this.data().inputs?.['definition'] as { id: number } | null;
        if (definition?.id) {
            this.router.navigateByUrl(
                `/dashboard/${this.dashboardStore.dashboardId()}/report/${definition.id}`,
                {
                    state: {
                        mode: 'edit',
                        source: 'tile',
                        meta: {
                            name: this.data().name,
                            description: this.data().description,
                        }
                    }
                }
            );
        }
    }
}
