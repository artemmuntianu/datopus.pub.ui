import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { BaseApiService } from './base-api.service';

@Injectable({
    providedIn: 'root'
})
export class ReportsFeaturesInsightsService extends BaseApiService {

    constructor(private sbService: SupabaseService) {
        super();
    }

    async getAll(orgId: number) {
        return await this.sbService.client
            .from('monitor_insight')
            .select(`
                date,
                text,
                val,
                is_percent,
                stats,
                stats_dates,
                monitor!inner(
                    name,
                    metric,
                    threshold_val,
                    threshold_is_percent,
                    filter
                )
            `)
            .eq('monitor.org_id', orgId)
            .order('date', { ascending: false });
    }

    async getDims(orgId: number) {
        return await this.sbService.getDims(orgId);
    }

}