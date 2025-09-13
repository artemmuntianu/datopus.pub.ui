import { CommonModule, PercentPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexStroke,
    ApexYAxis,
    ApexTitleSubtitle,
    ApexLegend,
    NgApexchartsModule,
    ApexGrid,
    ApexTooltip,
    ApexFill
} from 'ng-apexcharts';
import { ReportFeaturesInsight } from '../../../../services/api/models/reportFeaturesInsight';
import * as Utils from '../../../../../utilities';

type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    title: ApexTitleSubtitle;
    labels: string[];
    legend: ApexLegend;
    fill: ApexFill;
    subtitle: ApexTitleSubtitle;
};

@Component({
    selector: 'app-reports-features-insights-card',
    standalone: true,
    imports: [RouterLink, CommonModule, MatCardModule, MatTooltipModule, MatButtonModule, MatIconModule, NgApexchartsModule, PercentPipe],
    templateUrl: './reports-features-insights-card.component.html',
    styleUrl: './reports-features-insights-card.component.scss'
})
export class ReportsFeaturesInsightsCardComponent {

    @Input() insight: ReportFeaturesInsight;
    @Output() viewMonitorSettingsClick = new EventEmitter<ReportFeaturesInsight>();
    chartOptions: Partial<ChartOptions>;

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        this.chartOptions = {
            series: [
                {
                    name: Utils.capitalize(this.insight.monitor.metric),
                    data: this.insight.serieValues
                }
            ],
            chart: {
                type: 'area',
                height: 150,
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight',
                width: 2
            },
            fill: {
                type: "gradient",
                gradient: {
                    opacityFrom: 0.75,
                    opacityTo: 0.5
                }
            },
            labels: this.insight.serieDates,
            xaxis: {
                type: 'datetime',
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    show: false,
                    datetimeUTC: false
                }
            },
            yaxis: {
                labels: {
                    show: false
                }
            },
            grid: {
                show: false
            },
            tooltip: {
                y: {
                    formatter: val => val.toLocaleString()
                }
            }
        };
    }

}