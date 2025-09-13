import { Injectable } from '@angular/core';
import { ChartType as ApexChartType } from 'ng-apexcharts';
import {
    BQDimensionDefinition,
    BQMetricDefinition,
    ChartType
} from '../../../../reports/features/models/reports-definition';
import { ChartOptions } from '../types/apex-config';
import { merge } from '../../../../../shared/utils/merge';

@Injectable()
export class ChartOptionsBuilder {
    constructor(private strategyFactory: ChartOptionsStrategyFactory) {}

    build(
        chartType: ChartType,
        { x, xLabel }: { x: string; xLabel: string },
        { y, yLabel }: { y: string; yLabel: string },
        defaultConfig: ChartOptions
    ): ChartOptions {
        const strategy = this.strategyFactory.getStrategy(chartType);
        return strategy.patch(defaultConfig, { x, xLabel }, { y, yLabel });
    }
}

export abstract class ChartOptionsStrategy {
    abstract type(): ApexChartType;

    abstract patch(
        config: ChartOptions,
        { x, xLabel }: { x: string; xLabel: string },
        { y, yLabel }: { y: string; yLabel: string }
    ): ChartOptions;
}

export class LineChartOptionsStrategy extends ChartOptionsStrategy {
    override type(): ApexChartType {
        return 'area';
    }

    override patch(
        config: ChartOptions,
        { x, xLabel }: { x: string; xLabel: string },
        { y, yLabel }: { y: string; yLabel: string }
    ): ChartOptions {
        return merge(merge({}, config), {
            yaxis: {
                title: { text: yLabel }
            },
            xaxis: {
                labels: {
                    formatter: undefined
                },
                type: x === 'event_date' ? 'datetime' : 'category'
            },
            chart: { type: this.type() }
        } as ChartOptions);
    }
}

export class BarChartOptionsStrategy extends ChartOptionsStrategy {
    override type(): ApexChartType {
        return 'bar';
    }

    override patch(
        config: ChartOptions,
        { x, xLabel }: { x: string; xLabel: string },
        { y, yLabel }: { y: string; yLabel: string }
    ): ChartOptions {
        let patchValue = {
            plotOptions: { bar: { horizontal: true } },
            chart: { type: this.type(), stacked: true },
            xaxis: {
                title: { text: yLabel },
                labels: {
                    formatter: undefined
                }
            }
        };

        if (x === 'event_date') {
            patchValue = merge(patchValue, {
                yaxis: {
                    labels: {
                        formatter: (value: any) => {
                            if (value) {
                                return new Date(value).toLocaleDateString('en-GB');
                            }
                            return value.toString();
                        }
                    }
                }
            });
        }

        return merge<ChartOptions, Partial<ChartOptions>>(merge({}, config), patchValue);
    }
}

export class FunnelChartOptionsStrategy extends ChartOptionsStrategy {
    override type(): ApexChartType {
        return 'bar';
    }

    override patch(
        config: ChartOptions,
        { x, xLabel }: { x: string; xLabel: string },
        { y, yLabel }: { y: string; yLabel: string }
    ): ChartOptions {
        return merge<ChartOptions, Partial<ChartOptions>>(merge({}, config), {
            plotOptions: { bar: { horizontal: true, isFunnel: true } },
            chart: { type: this.type() },
            yaxis: { title: { text: yLabel } }
        });
    }
}

export class ColumnChartOptionsStrategy extends ChartOptionsStrategy {
    override type(): ApexChartType {
        return 'bar';
    }

    override patch(
        config: ChartOptions,
        { x, xLabel }: { x: string; xLabel: string },
        { y, yLabel }: { y: string; yLabel: string }
    ): ChartOptions {
        return merge<ChartOptions, Partial<ChartOptions>>(merge({}, config), {
            chart: { type: this.type() },
            yaxis: { title: { text: yLabel } },
            xaxis: {
                type: x === 'event_date' ? 'datetime' : 'category'
            },
            plotOptions: { bar: { horizontal: false } }
        });
    }
}

@Injectable()
export class ChartOptionsStrategyFactory {
    private strategyRegistry = new Map<ChartType, new () => ChartOptionsStrategy>([
        ['line', LineChartOptionsStrategy],
        ['bar', BarChartOptionsStrategy],
        ['funnel', FunnelChartOptionsStrategy],
        ['column', ColumnChartOptionsStrategy]
    ]);

    getStrategy(chartType: ChartType): ChartOptionsStrategy {
        const StrategyClass = this.strategyRegistry.get(chartType);
        if (!StrategyClass) {
            throw new Error(`Unsupported chart type: ${chartType}`);
        }
        return new StrategyClass();
    }
}
