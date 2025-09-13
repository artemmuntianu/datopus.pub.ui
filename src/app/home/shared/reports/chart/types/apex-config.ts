import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexMarkers,
    ApexTitleSubtitle,
    ApexFill,
    ApexYAxis,
    ApexGrid,
    ApexXAxis,
    ApexStroke,
    ApexTooltip,
    ApexPlotOptions,
} from 'ng-apexcharts';

export type ChartData = ApexAxisChartSeries;

export type ChartOptions = {
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
    plotOptions: ApexPlotOptions;
    data: ApexAxisChartSeries;
};
