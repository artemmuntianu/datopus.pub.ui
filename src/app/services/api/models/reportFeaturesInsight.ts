export class ReportFeaturesInsight {

    date: string;
    subtitle: string;
    value: number;
    isPercent: boolean;
    serieValues: number[];
    serieDates: string[];
    monitor: {
        name: string;
        metric: string;
        comparison: string;
        thresholdVal: number;
        thresholdIsPercent: boolean;
        filter: { key: string, value: string | null }[];
    }

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }

}