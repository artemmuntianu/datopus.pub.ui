import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { BaseApiService } from './base-api.service';
import { utcDateToLocal } from '../../../utilities';

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends BaseApiService {

    constructor(private sbService: SupabaseService) {
        super();
    }

    async getFeatureStats(from: Date, to: Date, datasourceIds: number[]) {
        return await this.sbService.client
            .from('stats')
            .select(`feature,actions:actions.sum()`)
            .in('datasource_id', datasourceIds)
            .gte('date', utcDateToLocal(from).toISOString())
            .lte('date', utcDateToLocal(to).toISOString());
    }

    async getInsights(from: Date, to: Date, orgId: number) {
        return await this.sbService.client
            .from('monitor_insight')
            .select(`
                date,
                text,
                monitor!inner(
                    org_id
                )
            `)
            .eq('monitor.org_id', orgId)
            .gte('date', utcDateToLocal(from).toISOString())
            .lte('date', utcDateToLocal(to).toISOString());
    }

    async getDashboardUsers(from: Date, to: Date, orgId: number) {
        const timezoneDiffMs = from.getTimezoneOffset() * 60 * 1000;
        return new Promise<{email: string, signins: number, date: string}[]>((resolve, reject) => {
            resolve([
                { email: 'wbisquera@bromeil.com', signins: 10, date: '2024-08-07' },
                { email: 'adamnem@disipulo.com', signins: 15, date: '2024-08-04' },
            ]);
        });
    }

}