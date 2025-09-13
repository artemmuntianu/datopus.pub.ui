import { GaDataDimension, GaDataMetric } from '.';
import { GaMetricAggregation } from '../types/v1beta/ga-metric';
import { GaFilterExpression } from './ga-filter';
import { GaOrderBy } from './ga-order-by';

export class MinuteRange {
    constructor(
        public name: string,
        public startMinutesAgo: number,
        public endMinutesAgo: number
    ) {}
}

export class GaDataRunRealtimeReportReq {
    dimensions?: GaDataDimension[];
    metrics?: GaDataMetric[];
    dimensionFilter?: GaFilterExpression | undefined;
    metricFilter?: GaFilterExpression | undefined;
    limit?: string | undefined;
    metricAggregations?: GaMetricAggregation[] | undefined;
    offset?: string | undefined;
    orderBys?: GaOrderBy[] | undefined;
    returnPropertyQuota?: boolean | undefined;
    minuteRanges?: MinuteRange[];

    constructor(data: Partial<GaDataRunRealtimeReportReq>) {
        Object.assign(this, data);
    }
}
