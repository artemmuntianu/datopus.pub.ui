import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { HomeTimeService } from '../../../shared/services/home-time.service';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ReportSettingsComponent } from '../settings/report-settings.component';
import { NgDatePickerModule } from 'ng-material-date-range-picker';
import { BreadcrumbService } from '../../../../common/breadcrumbs/breadcrumb.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { ReportsStore } from '../../../../store/reports/reports.store';
import { ReportSettings } from '../models/reports-definition';
import { ReportVisualComponent } from '../../../shared/reports/report-visual.component';
import { DatasourceStore } from '../../../../store/datasource/datasource.store';
import { ReportApiErrorComponent } from '../../../shared/reports/errors/report-api-error/report-api-error.component';

@Component({
    selector: 'app-report',
    standalone: true,
    imports: [
        CommonModule,
        CommonModule,
        MatCardModule,
        MatIcon,
        MatDividerModule,
        MatSidenavModule,
        ReportSettingsComponent,
        MatButtonModule,
        NgScrollbarModule,
        NgDatePickerModule,
        ReportVisualComponent,
        ReportApiErrorComponent
    ],
    templateUrl: './report.component.html',
    styleUrl: './report.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent {
    @ViewChild(MatDrawer) drawer: MatDrawer;


    readonly timeService = inject(HomeTimeService);
    readonly reportsStore = inject(ReportsStore);
    readonly datasourceStore = inject(DatasourceStore);

    definition = this.reportsStore.selectedReport;
    bqDatasource = this.datasourceStore.bqDatasource;
    definitionError = this.reportsStore.getReportError('fetchReport');
    customSettings = signal<ReportSettings | null>(null);
    readonly breadcrumbService = inject(BreadcrumbService);

    params = signal<ParamMap | null>(null);

    saveEnabled = signal(false);
    name = signal<string | undefined>(undefined);
    description = signal<string | undefined>(undefined);

    route = inject(ActivatedRoute);
    router = inject(Router);

    constructor() {
        const state = history.state;

        if (state?.mode === 'edit') {
            this.saveEnabled.set(true);
        }

        if (state?.meta?.name) {
            this.name.set(state.meta.name);
        }

        if (state?.meta?.description) {
            this.description.set(state.meta.description);
        }

        effect(
            () => {
                const definition = this.definition();

                if (definition) {
                    this.breadcrumbService.setHeaderBreadcrumb( [
                        'Feature Reports',
                        this.name() ?? definition.systemName ?? definition.id.toString()
                    ], this.description());
                }
            },
            { allowSignalWrites: true }
        );
        this.route.paramMap
            .pipe(
                takeUntilDestroyed(),
                tap(params => {
                    this.params.set(params);
                }),
                switchMap(async params => {
                    const name = params.get('systemName');
                    if (name) {
                        await this.reportsStore.fetchSystemReport(name);
                    } else {
                        await this.reportsStore.fetchCustomReport(Number(params.get('reportId')));
                    }
                })
            )
            .subscribe();
    }

    ngOnInit() {
        this.datasourceStore.fetchBQDatasource();
        this.reportsStore.fetchDimensions();
        this.reportsStore.fetchMetrics();
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }


    isAlertVisible = {
        reportExplanation: true,
        filtersRequired: false
    };

    async saveSettingsAndGoBack() {
        if (this.customSettings()) {
            await this.reportsStore.saveReport(this.definition()!);
        }
        this.router.navigateByUrl(`dashboard/${this.params()!.get('dashboardId')!}`);
    }

    async applyNewSettings(settings: ReportSettings) {
        this.customSettings.set(settings);
        this.reportsStore.applySettings(this.definition()!, settings);
    }

    onBtnClick_ShowHideSettingsPane() {
        this.drawer.toggle();
        setTimeout(() => {
            window.dispatchEvent(new Event('resize')); /* hack to make apexchart resize itself */
        }, 100);
    }
}
