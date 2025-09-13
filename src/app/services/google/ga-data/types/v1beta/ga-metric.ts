export enum GaMetricAggregation {
    METRIC_AGGREGATION_UNSPECIFIED = 'METRIC_AGGREGATION_UNSPECIFIED',
    TOTAL = 'TOTAL',
    MINIMUM = 'MINIMUM',
    MAXIMUM = 'MAXIMUM',
    COUNT = 'COUNT'
}

export interface GaMetric {
    name?: string;
    expression?: string;
    invisible?: boolean;
}

export enum GaMetricType {
    METRIC_TYPE_UNSPECIFIED = 'METRIC_TYPE_UNSPECIFIED',
    TYPE_INTEGER = 'TYPE_INTEGER',
    TYPE_FLOAT = 'TYPE_FLOAT',
    TYPE_SECONDS = 'TYPE_SECONDS',
    TYPE_MILLISECONDS = 'TYPE_MILLISECONDS',
    TYPE_MINUTES = 'TYPE_MINUTES',
    TYPE_HOURS = 'TYPE_HOURS',
    TYPE_STANDARD = 'TYPE_STANDARD',
    TYPE_CURRENCY = 'TYPE_CURRENCY',
    TYPE_FEET = 'TYPE_FEET',
    TYPE_MILES = 'TYPE_MILES',
    TYPE_METERS = 'TYPE_METERS',
    TYPE_KILOMETERS = 'TYPE_KILOMETERS'
}

export interface MetricHeader {
    name: string;
    type: GaMetricType;
}

export interface MetricValue {
    value: string;
}
