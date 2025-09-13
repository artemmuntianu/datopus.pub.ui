import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import {
    ChartOptionsBuilder,
    ChartOptionsStrategyFactory
} from '../reports/chart/services/option-builder.service';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DEFAULT_CHART_CONFIG } from '../reports/chart/consts/chart-default-configuration';
import { ChartDataTransformerFactory } from '../reports/chart/services/data-transformer.service';
import { ChartOptions } from '../reports/chart/types/apex-config';


export const VisualTypes = {
    chart: {
        line: 'Line Chart',
        bar: 'Bar Chart',
        funnel: 'Funnel Chart',
        column: 'Column Chart'
    } as const,
    table: {
        regular: 'Table'
    } as const,
    diagram: {
        sankey: 'Flow Diagram'
    } as const
} as const;

export class VisualTypeIcon {
    constructor(
        public uiName: string,
        public uiClass: string = ''
    ) { }
}

export type ChartType = keyof typeof VisualTypes.chart;

@Component({
    selector: 'app-chart',
    standalone: true,
    imports: [MatCardModule, NgApexchartsModule],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.scss',
    providers: [ChartOptionsBuilder, ChartDataTransformerFactory, ChartOptionsStrategyFactory],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent {
    type = input.required<ChartType>();
    data = input<Record<string, string | number>[]>();
    x = input<string | null>();
    y = input<string | null>();
    z = input<string | null>();

    chartOptions = signal<ChartOptions | null>(null);

    private readonly chartOptionsBuilder = inject(ChartOptionsBuilder);
    private readonly dataTransformerFactory = inject(ChartDataTransformerFactory);
    constructor() {
        effect(
            () => {
                const y = this.y();
                const x = this.x();
                const z = this.z();
                const data = this.data();
                const type = this.type();

                if (data && type && x && y) {
                    this.loadChart(type, data, y, x, z);
                }
            },
            { allowSignalWrites: true }
        );
    }
    private loadChart(
        type: ChartType,
        data: Record<string, string | number>[],
        y: string,
        x: string,
        z: string | null | undefined
    ) {
        const dataTransformer = this.dataTransformerFactory.resolve(type);
        const config = this.chartOptionsBuilder.build(
            type,
            { x, xLabel: x },
            { y, yLabel: y },
            DEFAULT_CHART_CONFIG
        );

        const transformedData = dataTransformer.transform(data, y, x, z);

        config.xaxis.categories = transformedData.categories ?? [];
        config.data = transformedData.series ?? [];

        this.chartOptions.set(config);
    }
}
