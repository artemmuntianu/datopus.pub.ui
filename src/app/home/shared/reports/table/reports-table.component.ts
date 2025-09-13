import { CommonModule } from '@angular/common';
import {
    Component,
    ChangeDetectionStrategy,
    effect,
    inject,
    signal,
    input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import {
    ReportDefinition,
    ReportSettings,
    BQDimensionDefinition,
    BQMetricDefinition,
    BQOrderBy
} from '../../../reports/features/models/reports-definition';
import { ReportsBQDataService } from '../../../reports/services/reports-bq-data.service';
import { HomeTimeService } from '../../services/home-time.service';
import { DateRange } from '../../../../shared/types/date-range';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BQApiError, BQApiErrorCode } from '../../../../services/google/big-query/models/bq-error';
import { ReportsBQApiError } from '../errors/bq-api-error/bq-api-error.component';
import { TableColumnDefinition, TableTileComponent } from '../../table-tile/table-tile.component';
import { TableValueDateFormatterSettings } from '../../table-tile/formaters/table-value-formatter-settings';
import { BQDatasource } from '../../../../services/api/models';

@Component({
    selector: 'app-reports-table',
    styleUrl: './reports-table.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        RouterModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        ReportsBQApiError,
        TableTileComponent,
    ],
    templateUrl: './reports-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsTableComponent {
    private readonly timeService = inject(HomeTimeService);
    private readonly dataService = inject(ReportsBQDataService);

    definition = input.required<ReportDefinition>();
    datasource = input.required<BQDatasource>();

    bqError = signal<BQApiError | null>(null);
    loading = signal<boolean>(false);
    timeRange = this.timeService.getGlobalDateRangeTime();
    visibleColumns = signal<TableColumnDefinition[] | null>(null);
    dataSource = signal<Record<string, string | number>[] | null>(null);
    constructor() {
        effect(
            async () => {
                const config = this.definition();
                const source = this.datasource();

                const timeRange = this.timeRange();

                if (!this.shouldLoadTable(config)) return;

                this.loading.set(true);

                await this.fetchAndLoadTable(source,config!.settings, timeRange);
                this.loading.set(false);
            },
            { allowSignalWrites: true }
        );
    }

    private shouldLoadTable(config: ReportDefinition | null): boolean {
        return !!config && config.settings.selectedVisual.type === 'table';
    }

    private async fetchAndLoadTable(datasource: BQDatasource, settings: ReportSettings, dateRange: DateRange) {
        const { selectedDimensions, selectedMetrics, metricFilter, dimensionFilter, selectedSort } =
            settings;
        this.bqError.set(null);

        let stats: Record<string, string | number>[];
        try {
            stats = await this.dataService.getStats(datasource, {
                options: {
                    mapKey: 'uiName'
                },
                dateRange,
                metrics: selectedMetrics,
                dimensions: selectedDimensions,
                dimensionFilter,
                metricFilter,
                orderBys: [selectedSort].filter((sort): sort is BQOrderBy => !!sort)
            });
        } catch (err) {
            if (err instanceof BQApiError) {
                this.bqError.set(err);
            } else {
                console.error(err);
                this.bqError.set(
                    new BQApiError(BQApiErrorCode.UNKNOWN_ERROR, 'An unknown error occured')
                );
            }
            stats = [] as Record<string, string | number>[];
        }

        this.dataSource.set(stats);
        this.createColumns(selectedDimensions, selectedMetrics);
    }

    private createColumns(dimensions: BQDimensionDefinition[], metrics: BQMetricDefinition[]) {
        const names = [...dimensions, ...metrics].map(field => {
            return {
                name: field.uiName,
                formatterSettings:
                    field.apiName === 'event_date'
                        ? new TableValueDateFormatterSettings('yyyy-MM-dd')
                        : undefined
            };
        }) as TableColumnDefinition[];
        this.visibleColumns.set(names);
    }
}
