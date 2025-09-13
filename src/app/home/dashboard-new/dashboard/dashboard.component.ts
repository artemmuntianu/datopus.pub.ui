import { ChangeDetectionStrategy, Component, effect, inject, ViewChild } from '@angular/core';
import { TileComponent } from '../tile/tile.component';
import { DashboardHeaderComponent } from './header/dashboard-header';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreadcrumbService } from '../../../common/breadcrumbs/breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    DASHBOARD_ROW_HEIGHT_PX,
    DASHBOARD_WIDTH,
    DashboardStore
} from '../../../store/dashboard/dashboard.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import {
    ConfirmDialogComponent,
    ConfirmDialogModel
} from '../../../common/confirmation-dialog/confirmation-dialog.component';
import { DatasourceStore } from '../../../store/datasource/datasource.store';
import EmptyDashboardComponent from './empty/empty-dashboard.component';
import DashboardErrorComponent from './error/dashboard-error.component';
import { KtdGridComponent, KtdGridLayout, KtdGridModule } from '@katoid/angular-grid-layout';
import { DashboardDialogComponent } from './dialogs/dashboard-dialog/dashboard-dialog.component';
import { TileDialogComponent } from '../tile/tile-dialog/tile-dialog.component';
import { NEW_REPORT_DEFAULT_CONFIGURATION_SETTINGS } from '../../reports/consts/reports-default-configuration';
import {  debounceTime, fromEvent, merge, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        TileComponent,
        DashboardHeaderComponent,
        MatGridListModule,
        MatProgressSpinnerModule,
        EmptyDashboardComponent,
        DashboardErrorComponent,
        KtdGridModule
    ],
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-dashboard-header
            (deleteDashboard)="deleteDashboard()"
            (renameDashboard)="renameDashboard()"
            (changeDashboardDescription)="changeDashboardDescription()"
            (changeDashboardLayout)="changeDashboardLayout()"
            (addTile)="createTile()"
        />
        @if (dashboardStore.loadingTiles()) {
            <div class="w-full h-full d-flex align-items-center justify-content-center mt-100">
                <mat-progress-spinner mode="indeterminate" [diameter]="100"></mat-progress-spinner>
            </div>
        } @else {
            @if (dashboardError(); as error) {
                <app-dashboard-error
                    [error]="error"
                    class="w-100 h-100 d-block"
                ></app-dashboard-error>
            } @else {
                @if (dashboardStore.layout(); as layout) {
                    <ktd-grid
                        [cols]="cols"
                        [rowHeight]="rowHeight"
                        [gap]="10"
                        [layout]="layout"
                        [scrollableParent]="document"
                        (layoutUpdated)="onLayoutUpdated($event)"
                    >
                        @for (tile of dashboardStore.tiles(); track tile.id) {
                            <ktd-grid-item
                                [id]="tile.id.toString()"
                                [resizable]="dashboardStore.settings.layoutMode() === 'edit'"
                                [draggable]="dashboardStore.settings.layoutMode() === 'edit'"
                            >
                                <app-tile [data]="tile" />
                            </ktd-grid-item>
                        } @empty {
                            <app-empty-dashboard
                                style="height: 70vh; width: 70vw; margin: 0 auto;"
                                (addTile)="createTile()"
                            ></app-empty-dashboard>
                        }
                    </ktd-grid>
                }
            }
        }
        <ng-template ktdGridItemPlaceholder></ng-template>
    `
})
export default class DashboardComponent {
    @ViewChild(KtdGridComponent, {static: false}) grid: KtdGridComponent;

    dashboardStore = inject(DashboardStore);
    datasourceStore = inject(DatasourceStore);
    document = inject(DOCUMENT);
    cols: number = DASHBOARD_WIDTH;
    rowHeight: number = DASHBOARD_ROW_HEIGHT_PX;
    route = inject(ActivatedRoute);
    router = inject(Router);
    dialog = inject(MatDialog);
    resizeSubscription: Subscription;
    dashboardError = this.dashboardStore.getDashboardError('fetchTiles');

    protected breadcrumbService = inject(BreadcrumbService);

    constructor() {
        this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(async params => {
            if (this.dashboardStore.settings.layoutMode() === 'edit') {
                this.dashboardStore.setLayoutMode('view', true);
            }
            this.dashboardStore.fetchTiles(Number(params.get('dashboardId')));
        });

        effect(
            () => {
                const dashboard = this.dashboardStore.selectedDashboard();

                if (dashboard) {
                    this.breadcrumbService.setHeaderBreadcrumb(
                        ['Dashboards', dashboard.name],
                        dashboard.description ?? undefined
                    );
                }
            },
            { allowSignalWrites: true }
        );
    }

    ngOnInit() {
        this.datasourceStore.fetchBQDatasource();
    }

    ngAfterViewInit() {
        // hack to resize grid to respect scroll
        setTimeout(()=> {
            this.grid?.resize();
        }, 2000);

        this.resizeSubscription = merge(
            fromEvent(window, 'resize'),
            fromEvent(window, 'orientationchange')
        ).pipe(
            debounceTime(500),
        ).subscribe(() => {
            this.grid?.resize();
        });
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
        this.resizeSubscription?.unsubscribe();
    }


    onLayoutUpdated(layout: KtdGridLayout) {
        this.dashboardStore.updateLayout(layout);
    }

    async deleteDashboard() {
        const dialogData = new ConfirmDialogModel('Confirm dashboard removal');

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '600px',
            data: dialogData,
            backdropClass: 'dashboard-dialog-backdrop'
        });

        dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
            if (confirmed) {
                await this.dashboardStore.deleteDashboard();

                const dashboards = this.dashboardStore.dashboards();

                if (dashboards.length) {
                    this.router.navigateByUrl(`dashboard/${dashboards[dashboards.length - 1].id}`);
                } else {
                    this.router.navigateByUrl('');
                }
            }
        });
    }

    renameDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {
                type: 'rename',
                title: 'Dashboard Name',
                name: this.dashboardStore.selectedDashboard()?.name
            },
            backdropClass: 'dashboard-dialog-backdrop',
            exitAnimationDuration: '200ms',
            enterAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const { name } = result;
                const dashboardId = this.dashboardStore.selectedDashboard()?.id;

                if (dashboardId) {
                    this.dashboardStore.updateDashboard({ name }, dashboardId);
                }
            }
        });
    }

    changeDashboardDescription() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {
                type: 'description',
                title: 'Dashboard Description',
                description: this.dashboardStore.selectedDashboard()?.description
            },
            backdropClass: 'dashboard-dialog-backdrop',
            exitAnimationDuration: '200ms',
            enterAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const { description } = result;
                const dashboardId = this.dashboardStore.selectedDashboard()?.id;

                if (dashboardId) {
                    this.dashboardStore.updateDashboard({ description }, dashboardId);
                }
            }
        });
    }

    changeDashboardLayout() {
        const newLayout = this.dashboardStore.settings.layoutMode() === 'edit' ? 'view' : 'edit';
        this.dashboardStore.setLayoutMode(newLayout, newLayout == 'view' ? true : false);
    }

    createTile() {
        const dialogRef = this.dialog.open(TileDialogComponent, {
            width: '600px',
            data: {
                type: 'create',
                title: 'New Tile'
            },
            backdropClass: 'dashboard-dialog-backdrop',
            exitAnimationDuration: '200ms',
            enterAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                const { visual, width, height, name, description } = result;

                const settings = {
                    ...NEW_REPORT_DEFAULT_CONFIGURATION_SETTINGS,
                    selectedVisual: visual
                } as any;

                const meta = await this.dashboardStore.saveNewTile(
                    { height, width, name: name, description: description },
                    { settings }
                );

                if (meta) {
                    this.router.navigateByUrl(
                        `/dashboard/${this.dashboardStore.dashboardId()}/report/${meta.contentId}`,
                        {
                            state: {
                                mode: 'edit',
                                source: 'dashboard',
                                meta: {
                                    name,
                                    description
                                }
                            }
                        }
                    );
                }

                const dashboardId = this.dashboardStore.selectedDashboard()?.id;

                if (dashboardId) {
                    this.dashboardStore.updateDashboard({ description }, dashboardId);
                }
            }
        });
    }
}
