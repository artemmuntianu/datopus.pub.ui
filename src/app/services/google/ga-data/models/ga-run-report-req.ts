import { GaDataDateRange, GaDataDimension, GaDataMetric } from '.';
import { GaCohortSpec } from '../types/v1beta/ga-cohort';
import { GaComparison } from '../types/v1beta/ga-comparison';
import { GaMetricAggregation } from '../types/v1beta/ga-metric';
import { GaFilterExpression } from './ga-filter';
import { GaOrderBy } from './ga-order-by';

export class GaDataRunReportReq {
    dimensions: GaDataDimension[];
    metrics: GaDataMetric[];
    dateRanges: GaDataDateRange[];
    cohortSpec?: GaCohortSpec | undefined;
    comparisons?: GaComparison[] | undefined;
    currencyCode?: string | undefined;
    dimensionFilter?: GaFilterExpression | undefined;
    keepEmptyRows?: boolean | undefined;
    limit?: string | undefined;
    metricAggregations?: GaMetricAggregation[] | undefined;
    metricFilter?: GaFilterExpression | undefined;
    offset?: string | undefined;
    orderBys?: GaOrderBy[] | undefined;
    returnPropertyQuota?: boolean | undefined;

    constructor(data: Partial<GaDataRunReportReq>) {
        Object.assign(this, data);
    }
}
