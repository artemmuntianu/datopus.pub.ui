import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GAEventTrackerComponent } from '../../../dashboard/ga/ga-event-tracker/ga-event-tracker.component';
import { DatasourceStore } from '../../../../store/datasource/datasource.store';
import { HomeTimePickerComponent } from '../../../shared/time-picker/home-time-picker.component';
import { DashboardStore } from '../../../../store/dashboard/dashboard.store';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-dashboard-header',
    standalone: true,
    imports: [
        MatIcon,
        MatMenuModule,
        MatButtonModule,
        NgClass,
        MatButtonToggleModule,
        GAEventTrackerComponent,
        MatProgressBar,
        HomeTimePickerComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DatasourceStore],
    styleUrl: './dashboard-header.scss',
    template: `
        <div
            class="d-flex align-items-center justify-content-between position-relative g-5 p-10 bg-white border-radius "
        >
            <app-home-time-picker />

            <div class="flex-1"></div>

            <div class="d-flex align-items-center g-15 justify-content-end">
                @let gaSource = datasourceStore.gaDatasource();

                @if (gaSource !== null) {
                    <app-ga-event-tracker [datasource]="gaSource"></app-ga-event-tracker>
                }

                @if (dashboardStore.settings.layoutMode() === 'edit') {
                    <div class="d-flex g-5 edit-mode-actions-container">
                        <button
                            mat-flat-button
                            (click)="dashboardStore.saveTiles(); dashboardStore.setLayoutMode('view');"
                            class="daxa dashboard-header-menu-button"
                        >
                            <span>Save</span>
                        </button>
                        <button
                            (click)="dashboardStore.setLayoutMode('view', true)"
                            mat-stroked-button
                            class="dashboard-header-menu-button"
                        >
                            <span>Cancel</span>
                        </button>
                    </div>
                }
                <button
                    mat-flat-button
                    class="daxa dashboard-header-menu-button"
                    [disabled]="dashboardStore.settings.layoutMode() === 'edit'"
                    (click)="addTile.emit()"
                >
                    <div class="d-flex justify-content-center align-items-center g-5">
                        <mat-icon>add</mat-icon>
                        <span>New Tile</span>
                    </div>
                </button>

                <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu" (click)="deleteDashboard.emit()">
                    <button mat-menu-item (click)="renameDashboard.emit()">
                        <mat-icon class="text-d">edit</mat-icon>
                        <span>Rename</span>
                    </button>
                    <button mat-menu-item (click)="changeDashboardDescription.emit()">
                        <mat-icon class="text-d">edit_note</mat-icon>
                        <span>Change description</span>
                    </button>
                    <button mat-menu-item (click)="changeDashboardLayout.emit()">
                        <mat-icon class="text-d">view_comfy</mat-icon>
                        <span>Change layout</span>
                    </button>
                    <button mat-menu-item (click)="deleteDashboard.emit()">
                        <mat-icon class="text-danger">delete</mat-icon>
                        <span>Delete dashboard</span>
                    </button>
                </mat-menu>
            </div>
        </div>
        <mat-progress-bar
            mode="indeterminate"
            [ngClass]="{ 'd-hidden': !dashboardStore.loading() }"
        ></mat-progress-bar>
        <div class="mb-10"></div>
    `
})
export class DashboardHeaderComponent {
    readonly dialog = inject(MatDialog);

    dashboardStore = inject(DashboardStore);
    datasourceStore = inject(DatasourceStore);

    deleteDashboard = output();
    renameDashboard = output();
    changeDashboardDescription = output();
    changeDashboardLayout = output();
    addTile = output();
}
