import { DimensionHeader } from '../types/v1beta/ga-dimension';
import { MetricHeader } from '../types/v1beta/ga-metric';
import { Row } from '../types/v1beta/ga-report-row';

export class GaDataRunReportResp {
    dimensionHeaders?: DimensionHeader[];
    metricHeaders?: MetricHeader[];
    rows?: Row[];
    rowCount: number;
    metadata: Metadata;
    kind: string;
}

interface Metadata {
    schemaRestrictionResponse: Record<string, unknown>;
    currencyCode: string;
    timeZone: string;
}
