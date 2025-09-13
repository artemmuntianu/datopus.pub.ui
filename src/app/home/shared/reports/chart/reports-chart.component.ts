import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
    BQDimensionDefinition,
    BQMetricDefinition,
    BQOrderBy,
    ChartType,
    ReportSettings,
    ReportDefinition
} from '../../../reports/features/models/reports-definition';
import { ChartDataTransformerFactory } from './services/data-transformer.service';
import {
    ChartOptionsBuilder,
    ChartOptionsStrategyFactory
} from './services/option-builder.service';
import { ChartOptions } from './types/apex-config';
import { ReportsBQDataService } from '../../../reports/services/reports-bq-data.service';
import { DateRange } from '../../../../shared/types/date-range';
import { DEFAULT_CHART_CONFIG } from './consts/chart-default-configuration';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { HomeTimeService } from '../../services/home-time.service';
import { BQApiError, BQApiErrorCode } from '../../../../services/google/big-query/models/bq-error';
import { ReportsBQApiError } from '../errors/bq-api-error/bq-api-error.component';
import { BQDatasource } from '../../../../services/api/models';

@Component({
    selector: 'app-reports-chart',
    standalone: true,
    imports: [MatCardModule, NgApexchartsModule, NgIf, MatProgressSpinner, ReportsBQApiError],
    templateUrl: './reports-chart.component.html',
    styleUrl: './reports-chart.component.scss',
    providers: [ChartOptionsBuilder, ChartDataTransformerFactory, ChartOptionsStrategyFactory],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsChartComponent {
    private readonly chartOptionsBuilder = inject(ChartOptionsBuilder);
    private readonly dataTransformerFactory = inject(ChartDataTransformerFactory);

    private readonly timeService = inject(HomeTimeService);
    private readonly dataService = inject(ReportsBQDataService);

    bqError = signal<BQApiError | null>(null);
    chartOptions = signal<ChartOptions | null>(null);
    definition = input.required<ReportDefinition>();
    datasource = input.required<BQDatasource>();

    loading = signal<boolean>(false);
    timeRange = this.timeService.getGlobalDateRangeTime();

    constructor() {
        effect(
            async () => {
                const source = this.datasource();
                const config = this.definition();
                const timeRange = this.timeRange();

                if (!this.shouldLoadChart(config)) return;

                this.loading.set(true);
                await this.fetchAndLoadChart(source, config!.settings, timeRange);
                this.loading.set(false);
            },
            { allowSignalWrites: true }
        );
    }

    private shouldLoadChart(config: ReportDefinition | null): boolean {
        return !!config && config.settings.selectedVisual.type === 'chart';
    }

    private async fetchAndLoadChart(
        datasource: BQDatasource,
        settings: ReportSettings,
        dateRange: DateRange
    ) {
        this.bqError.set(null);
        const {
            selectedChartMetric,
            selectedChartDimension,
            selectedDrilldownDimension,
            dimensionFilter,
            metricFilter,
            selectedVisual,
            selectedSort
        } = settings;
        let stats;

        try {
            stats = await this.dataService.getStats(datasource, {
                dateRange,
                dimensionFilter,
                dimensions: [selectedChartDimension, selectedDrilldownDimension].filter(
                    (d): d is BQDimensionDefinition => !!d
                ),
                metricFilter,
                metrics: [selectedChartMetric],
                orderBys: [selectedSort].filter(
                    (sort): sort is BQOrderBy =>
                        !!sort &&
                        [
                            selectedChartDimension,
                            selectedDrilldownDimension,
                            selectedChartMetric
                        ].some(d => d?.apiName === sort.fieldName)
                )
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

        this.loadChart(
            selectedVisual.subtype as ChartType,
            stats,
            selectedChartMetric,
            selectedChartDimension,
            selectedDrilldownDimension
        );
    }

    private loadChart(
        type: ChartType,
        data: Record<string, string | number>[],
        metricDefinition: BQMetricDefinition,
        dimensionDefinition: BQDimensionDefinition,
        drilldownDefinition: BQDimensionDefinition | null
    ) {
        const dataTransformer = this.dataTransformerFactory.resolve(type);
        const config = this.chartOptionsBuilder.build(
            type,
            {x: dimensionDefinition.apiName, xLabel: dimensionDefinition.uiName},
            {y: metricDefinition.apiName, yLabel: metricDefinition.uiName},
            DEFAULT_CHART_CONFIG
        );

        const transformedData = dataTransformer.transform(
            data,
            metricDefinition.apiName,
            dimensionDefinition.apiName,
            drilldownDefinition?.apiName
        );

        config.xaxis.categories = transformedData.categories ?? [];
        config.data = transformedData.series ?? [];

        this.chartOptions.set(config);
    }
}
