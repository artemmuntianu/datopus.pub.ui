import { GaDateRange } from "./ga-range";

export interface GaCohortSpec {
    cohorts?: GaCohort[];
    cohortsRange?: GaCohortsRange;
    cohortReportSettings?: GaCohortReportSettings;
}

export interface GaCohort {
    name?: string;
    dimension?: string;
    dateRange?: GaDateRange;
}

export interface GaCohortsRange {
    granularity?: GaGranularity;
    startOffset?: number;
    endOffset?: number;
}

export enum GaGranularity {
    GRANULARITY_UNSPECIFIED = 'GRANULARITY_UNSPECIFIED',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}

export interface GaCohortReportSettings {
    accumulate?: boolean;
}