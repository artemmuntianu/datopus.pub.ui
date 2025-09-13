import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import * as d3 from 'd3';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexFill,
    ApexGrid,
    ApexMarkers,
    ApexStroke,
    ApexTitleSubtitle,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    ChartComponent,
    NgApexchartsModule
} from "ng-apexcharts";
import { IFeatureStatsTableElement } from '../reports-usage-demo.component';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    markers: ApexMarkers;
    title: ApexTitleSubtitle;
    fill: ApexFill;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    autoUpdateSeries: boolean;
}

@Component({
    selector: 'app-reports-features-usage-lineChart',
    standalone: true,
    imports: [RouterLink, MatCardModule, NgApexchartsModule, NgIf],
    templateUrl: './line-chart.component.html',
    styleUrl: './line-chart.component.scss'
})
export class ReportsFeaturesUsageLineChartComponent {

    @ViewChild(ChartComponent) apxChart: ChartComponent;
    chartOptions: Partial<ChartOptions>;

    setData(data: IFeatureStatsTableElement[], drilldownDimName: string | undefined, valueMetricName: string) {
        this.chartOptions.series = this.getChartOptions_Series(data, drilldownDimName, valueMetricName);
        this.chartOptions.yaxis = this.getChartOptions_yaxis(valueMetricName);
    }

    initData(data: IFeatureStatsTableElement[], drilldownDimName: string | undefined, valueMetricName: string) {
        this.chartOptions = this.getChartOptions_Common();
        this.chartOptions.series = this.getChartOptions_Series(data, drilldownDimName, valueMetricName);
        this.chartOptions.yaxis = this.getChartOptions_yaxis(valueMetricName);
    }

    private getChartOptions_Series(data: IFeatureStatsTableElement[], drilldownDimName: string | undefined, valueMetricName: string) {
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        let result;
        if (drilldownDimName) {
            const uniqueDimValues: string[] = data.map((x: any) => x[drilldownDimName]).filter((value, index, self) => self.indexOf(value) === index);
            result = uniqueDimValues.map(dimValue => {
                const filteredData = data.filter((x: any) => x[drilldownDimName] === dimValue);
                return {
                    name: dimValue,
                    data: this.groupByAndSummarize(filteredData, valueMetricName),
                    color: colorScale(dimValue)
                };
            });
        } else {
            result = [
                {
                    name: "All",
                    data: this.groupByAndSummarize(data, valueMetricName)
                }
            ];
        }
        return result;
    }

    private getChartOptions_Common(): Partial<ChartOptions> {
        return {
            chart: {
                type: "area",
                stacked: false,
                height: 350,
                animations: {
                    enabled: false
                },
                zoom: {
                    type: "x",
                    enabled: true,
                    autoScaleYaxis: true
                },
                toolbar: {
                    show: true
                },
                redrawOnWindowResize: true
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0
            },
            grid: {
                show: true,
                strokeDashArray: 5,
                borderColor: "#e0e0e0"
            },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.5,
                    opacityTo: 0
                }
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val.toLocaleString();
                    }
                }
            },
            xaxis: {
                type: "datetime",
                axisBorder: {
                    show: false,
                    color: '#e0e0e0'
                },
                axisTicks: {
                    show: true,
                    color: '#e0e0e0'
                },
                labels: {
                    show: true,
                    style: {
                        colors: "#919aa3",
                        fontSize: "14px"
                    }
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            autoUpdateSeries: true
        };
    }

    private getChartOptions_yaxis(valueMetricName: string) {
        return {
            labels: {
                formatter: function (val: number) {
                    return val.toLocaleString();
                },
                show: true,
                style: {
                    colors: "#919aa3",
                    fontSize: "14px"
                }
            },
            title: {
                text: valueMetricName[0].toUpperCase() + valueMetricName.slice(1),
                style: {
                    color: "#1f1f1f",
                    fontSize: "14px",
                    fontWeight: 500
                }
            },
            axisBorder: {
                show: false
            }
        };
    }

    private groupByAndSummarize(data: IFeatureStatsTableElement[], valueMetricName: string) {
        const result = data.reduce((acc, cur) => {
            const item = acc.length > 0 && acc.find((x) => x[0] == cur.date);
            if (item)
                item[1] += (<any>cur)[valueMetricName];
            else
                acc.push([cur.date, (<any>cur)[valueMetricName]]);
            return acc;
        }, <any[]>[]);

        result.sort((a: string[], b: string[]) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

        return result;
    }

}