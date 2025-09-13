import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { BaseApiService } from '../../services/api/base-api.service';
import {
    BQDimensionDefinition,
    BQMetricDefinition,
    ReportDefinition
} from '../../home/reports/features/models/reports-definition';
import { ReportApiError, ReportApiErrorCode } from './report-api-error';

@Injectable({
    providedIn: 'root'
})
export class ReportsService extends BaseApiService {
    constructor(private sbService: SupabaseService) {
        super();
    }

    async fetchReportDefinitionById(id: number) {
        const { error, data } = await this.sbService.client
            .from('visual_definition')
            .select('*')
            .eq('id', id)
            .single();


        if (error?.code === "PGRST116") {
            throw new ReportApiError(
                ReportApiErrorCode.NOT_FOUND,
                `Failed to fetch report`
            );
        }

        if (error) {
            throw new ReportApiError(
                ReportApiErrorCode.DB_ERROR,
                `Failed to fetch report: ${error.message}`
            );
        }

        if (data === null) {
            throw new ReportApiError(
                ReportApiErrorCode.NOT_FOUND,
                `Report with id '${id}' is not found`
            );
        }

        return ReportDefinition.fromApi(data);
    }

    async fetchReportDefinitionBySystemName(name: string) {
        const { error, data } = await this.sbService.client
            .from('visual_definition')
            .select('*')
            .eq('system_name', name)
            .single();

        if (error) {
            throw new ReportApiError(
                ReportApiErrorCode.DB_ERROR,
                `Failed to fetch report: ${error.message}`
            );
        }

        if (data === null) {
            throw new ReportApiError(
                ReportApiErrorCode.NOT_FOUND,
                `Report with system name '${name}' is not found`
            );
        }

        return ReportDefinition.fromApi(data);
    }

    async updateReport(report: ReportDefinition) {
        const { error, data } = await this.sbService.client
            .from('visual_definition')
            .update({
                settings: report.settings as any,
                explanation: report.explanation,
                system_name: report.systemName
            })
            .eq('id', report.id)
            .select('*')
            .single();

        if (error) {
            throw new ReportApiError(
                ReportApiErrorCode.DB_ERROR,
                `Failed to update report: ${error.message}`
            );
        }

        return ReportDefinition.fromApi(data);
    }

    async createReport(reportDefinition: Partial<ReportDefinition>) {
        const { error, data } = await this.sbService.client
            .from('visual_definition')
            .insert({
                settings: reportDefinition.settings as any
            })
            .select('*')
            .single();

        if (error) {
            throw new ReportApiError(
                ReportApiErrorCode.DB_ERROR,
                `Failed to save report: ${error.message}`
            );
        }
        return data;
    }

    async fetchMetrics() {
        const { error, data } = await this.sbService.client.from('big_query_metric').select('*');

        if (error) {
            throw new ReportApiError(
                ReportApiErrorCode.DB_ERROR,
                `Failed to fetch metrics: ${error.message}`
            );
        }

        return data.map(item => new BQMetricDefinition(item.ui_name, item.api_name, item.custom));
    }

    async fetchDimensions() {
        const { error, data } = await this.sbService.client.from('big_query_dimension').select('*');

        if (error) {
            throw new ReportApiError(
                ReportApiErrorCode.DB_ERROR,
                `Failed to fetch dimensions: ${error.message}`
            );
        }

        return data.map(
            item => new BQDimensionDefinition(item.ui_name, item.api_name, item.custom)
        );
    }
}
