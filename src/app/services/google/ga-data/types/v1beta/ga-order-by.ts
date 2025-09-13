export enum GaOrderType {
    ORDER_TYPE_UNSPECIFIED = 'ORDER_TYPE_UNSPECIFIED',
    ALPHANUMERIC = 'ALPHANUMERIC',
    CASE_INSENSITIVE_ALPHANUMERIC = 'CASE_INSENSITIVE_ALPHANUMERIC',
    NUMERIC = 'NUMERIC',
}

export interface GaPivotOrderBy {
    metricName?: string;
    pivotSelections?: GaPivotSelection[];
}

export interface GaPivotSelection {
    dimensionName?: string;
    dimensionValue?: string;
}
