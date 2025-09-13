import { ApexAxisChartSeries } from 'ng-apexcharts';
import { BQFieldDefinition, ChartType } from '../../../../reports/features/models/reports-definition';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';

type DataRow = Record<string, string | number>;

export interface ChartTransformationResult {
    series?: ApexAxisChartSeries;
    categories?: string[];
}

@Injectable({
    providedIn: 'root',
})
export class ChartDataTransformerFactory {
    private transformers = new Map<ChartType, ChartDataTransformer>();

    constructor() {
        this.transformers.set('bar', new BarChartTransformer());
        this.transformers.set('column', new ColumnChartTransformer());
        this.transformers.set('funnel', new FunnelChartTransformer());
        this.transformers.set('line', new LineChartTransformer());
    }

    resolve(chartType: ChartType): ChartDataTransformer {
        return this.transformers.get(chartType) ?? new BarChartTransformer();
    }
}

export abstract class ChartDataTransformer {
    protected colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    transform(
        data: DataRow[],
        yDef: string,
        xDef: string,
        zDef?: string | null,
        ignoreDrillDown = false
    ): ChartTransformationResult {
        // If drilldown is not applicable, return a single series.
        if (!zDef || ignoreDrillDown || yDef === zDef || xDef === zDef) {
            return {
                series: [
                    {
                        name: xDef,
                        data: this.groupAndSortData(
                            data,
                            yDef,
                            xDef,
                        ),
                    },
                ],
            };
        }
        

        const drilldownValues = this.getUniqueDimensionValues(
            data,
            zDef
        );

        const series = drilldownValues.map((drillValue) => {
            const filteredData = data.filter(
                (row) => row[zDef] === drillValue
            );
            return {
                name: drillValue,
                data: this.groupAndSortData(
                    filteredData,
                    yDef,
                    xDef,
                ),
                color: this.colorScale(drillValue),
            };
        });

        return {
            series,
            categories: this.getUniqueDimensionValues(data, xDef),
        };
    }

    protected getUniqueDimensionValues(
        data: DataRow[],
        dimensionName: string
    ): string[] {
        const values = data.map((row) => row[dimensionName].toString());
        return Array.from(new Set(values));
    }

    protected groupAndSortData(
        data: DataRow[],
        valueMetricName: string,
        dimensionName: string,
        sortFn?: (
            a: { x: string; y: number },
            b: { x: string; y: number }
        ) => number
    ): { x: string; y: number }[] {
        const aggregatedValues = new Map<string, number>();

        data.forEach((item) => {
            const key = item[dimensionName].toString();
            const value = item[valueMetricName] as number;
            aggregatedValues.set(key, (aggregatedValues.get(key) || 0) + value);
        });

        const result = Array.from(aggregatedValues, ([x, y]) => ({ x, y }));

        if (sortFn) {
            result.sort(sortFn);
        }

        return result;
    }

    protected getSortFn(
        dimensionName: string
    ): (a: { x: string; y: number }, b: { x: string; y: number }) => number {
        // TODO: Extend support for additional data types or allow external sort function injection.
        return dimensionName === 'event_date'
            ? (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
            : (a, b) => a.x.localeCompare(b.x);
    }
}

export class LineChartTransformer extends ChartDataTransformer {}

export class BarChartTransformer extends ChartDataTransformer {
    override transform(
        data: DataRow[],
        zDef: string,
        yDef: string,
        xDef: string
    ): ChartTransformationResult {
        return super.transform(
            data,
            zDef,
            yDef,
            xDef
        );
    }
}

export class ColumnChartTransformer extends ChartDataTransformer {}

export class FunnelChartTransformer extends ChartDataTransformer {
    override transform(
        data: DataRow[],
        zDef: string,
        yDef: string,
        xDef: string
    ): ChartTransformationResult {
        return super.transform(
            data,
            zDef,
            yDef,
            xDef,
            true
        );
    }
}
