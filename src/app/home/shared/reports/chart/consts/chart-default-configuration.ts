import { ChartOptions } from '../types/apex-config';

export const DEFAULT_CHART_CONFIG: ChartOptions = {
    chart: {
        stacked: false,
        height: '100%',
        animations: { enabled: false },
        zoom: { type: 'x', enabled: true, autoScaleYaxis: true },
        toolbar: { show: true },
        redrawOnWindowResize: true,
        type: 'area',
    },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    stroke: { curve: 'smooth', width: 2 },
    grid: { show: true, strokeDashArray: 5, borderColor: '#e0e0e0' },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
        },
    },
    tooltip: {
        y: { formatter: (val?: number) => {
            if (val) {
                return val.toLocaleString()
            }
            return `${val}`;
        } },
    },
 
    xaxis: {
        axisBorder: {
            show: false,
            color: '#e0e0e0',
        },
        axisTicks: {
            show: true,
            color: '#e0e0e0',
        },

        labels: {
            datetimeFormatter: {
                day: "dd",
                month: "MM",
                year: "yyyy"
            },
            format: 'dd/MM/yyyy',
            showDuplicates: false,
            hideOverlappingLabels: true,
            show: true,
            trim: false,
            style: {
                colors: '#919aa3',
                fontSize: '14px',
            },
        },
    },
    yaxis: {
        labels: {
            formatter: function (val: number) {
                return val.toLocaleString();
            },
            show: true,
            style: {
                colors: '#919aa3',
                fontSize: '14px',
            },
        },
        title: {
            text: '',
            style: {
                color: '#1f1f1f',
                fontSize: '14px',
                fontWeight: 500,
            },
        },
        axisBorder: {
            show: false,
        },
    },
    autoUpdateSeries: true,
    title: {},
    plotOptions: {},
    data: []
};