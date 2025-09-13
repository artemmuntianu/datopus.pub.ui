import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
    BQDimensionDefinition,
    BQMetricDefinition,
    ReportDefinition,
    ReportSettings,
    Visuals
} from '../../home/reports/features/models/reports-definition';
import { ReportsService } from './reports.service';
import { REPORT_VISUALS } from '../../home/reports/consts/reports-default-configuration';
import { ToastrService } from 'ngx-toastr';
import { ReportApiError, ReportApiErrorCode } from './report-api-error';

type ReportsState = {
    metrics: BQMetricDefinition[];
    dimensions: BQDimensionDefinition[];
    reports: Record<string, ReportDefinition>;
    errors: Record<string, ReportApiError | null>;
    selectedReportId: number | null;
    visuals: Visuals;
};

const initialState: ReportsState = {
    metrics: [],
    dimensions: [],
    reports: {},
    errors: {},
    selectedReportId: null,
    visuals: REPORT_VISUALS
};

export const ReportsStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ reports, selectedReportId }) => ({
        selectedReport: computed(() =>
            selectedReportId() !== null ? reports()[selectedReportId()!] : null
        )
    })),

    withMethods(
        (store, dataService = inject(ReportsService), toastrService = inject(ToastrService)) => ({
            applySettings(reportDef: ReportDefinition, newSettings: ReportSettings) {
                patchState(store, state => ({
                    reports: {
                        ...state.reports,
                        [reportDef.id]: {
                            ...state.reports[reportDef.id],
                            settings: newSettings
                        }
                    }
                }));
            },
            getReportError: (action: string) => computed(() => store.errors()[action] || null),
            async fetchMetrics() {
                try {
                    const metrics = await dataService.fetchMetrics();
                    patchState(store, state => ({
                        metrics,
                        errors: { ...state.errors, fetchMetrics: null }
                    }));
                } catch (err) {
                    this.handleError(
                        err,
                        'fetchMetrics',
                        'Unknown error occurred while fetching metrics'
                    );
                }
            },

            async fetchCustomReport(id: number) {
                const existingReport = store.reports()[id];

                if (existingReport) {
                    patchState(store, { selectedReportId: existingReport.id });
                    return;
                }

                try {
                    const fetchedReport = await dataService.fetchReportDefinitionById(id);
                    patchState(store, state => ({
                        errors: { ...state.errors, fetchReport: null },
                        reports: { ...state.reports, [id]: fetchedReport },
                        selectedReportId: fetchedReport.id
                    }));
                } catch (err) {
                    this.handleError(
                        err,
                        'fetchReport',
                        'Unknown error occurred while fetching custom report'
                    );
                }
            },

            async fetchSystemReport(systemName: string) {
                const existingReport = Object.values(store.reports()).find(
                    r => r.systemName === systemName
                );

                if (existingReport) {
                    patchState(store, { selectedReportId: existingReport.id });
                    return;
                }

                try {
                    const fetchedReport =
                        await dataService.fetchReportDefinitionBySystemName(systemName);

                    patchState(store, state => ({
                        errors: { ...state.errors, fetchReport: null },
                        reports: { ...store.reports(), [fetchedReport.id]: fetchedReport },
                        selectedReportId: fetchedReport.id
                    }));
                } catch (err) {
                    this.handleError(
                        err,
                        'fetchReport',
                        'Unknown error occurred while fetching system report'
                    );
                }
            },
            async fetchDimensions() {
                try {
                    const dimensions = await dataService.fetchDimensions();
                    patchState(store, state => ({
                        errors: { ...state.errors, fetchDimensions: null },
                        dimensions
                    }));
                } catch (err) {
                    this.handleError(
                        err,
                        'fetchDimensions',
                        'Unknown error occurred while fetching dimensions'
                    );
                }
            },

            async saveReport(reportDef: ReportDefinition) {
                try {
                    const updated = await dataService.updateReport(reportDef);
                    patchState(store, state => ({
                        errors: { ...state.errors, saveReport: null },
                        reports: { ...state.reports, [updated.id]: updated }
                    }));
                } catch (err) {
                    this.handleError(
                        err,
                        'saveReport',
                        'Unknown error occurred while saving report'
                    );
                }
            },

            async createReport(reportDefinition: Partial<ReportDefinition>) {
                return await dataService.createReport(reportDefinition);
            },

            handleError(err: any, action: string, defaultMessage: string) {
                const errorInstance =
                    err instanceof ReportApiError
                        ? err
                        : new ReportApiError(ReportApiErrorCode.UNKNOWN_ERROR, defaultMessage);
                patchState(store, state => ({
                    errors: { ...state.errors, [action]: errorInstance }
                }));
                toastrService.error(errorInstance.message);
            }
        })
    )
);
