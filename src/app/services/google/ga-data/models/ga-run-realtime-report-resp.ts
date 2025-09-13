import { DimensionHeader } from '../types/v1beta/ga-dimension';
import { MetricHeader } from '../types/v1beta/ga-metric';
import { Row } from '../types/v1beta/ga-report-row';

export class GaDataRunRealtimeReportResp {
    dimensionHeaders?: DimensionHeader[];
    metricHeaders?: MetricHeader[];
    rows?: Row[];
    maximums?: Row[];
    minimums?: Row[];
    rowCount: number;
    kind: string;
}
