import { GaMetricType } from "./ga-metric";

export interface GaDimensionMetaData {
    apiName: string;
    uiName: string;
    description: string;
    deprecatedApiNames?: string[];
    customDefinition?: boolean;
    category: string;
}

export enum GaBlockedReason {
    BLOCKED_REASON_UNSPECIFIED,
    NO_REVENUE_METRICS,
    NO_COST_METRICS,
}

export interface GaMetricMetaData {
    apiName: string;
    uiName: string;
    description: string;
    deprecatedApiNames?: string[];
    type: GaMetricType;
    expression?: string;
    customDefinition?: boolean;
    blockedReasons?: [GaBlockedReason];
    category: string;
}

export interface ComparisonMetaData {
    apiName: string;
    uiName: string;
    description: string;
}
