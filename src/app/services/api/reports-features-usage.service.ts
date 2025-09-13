import { Injectable } from '@angular/core';
import { utcDateToLocal } from '../../../utilities';
import { SupabaseService } from '../supabase/supabase.service';
import { BaseApiService } from './base-api.service';

@Injectable({
    providedIn: 'root'
})
export class ReportsFeaturesUsageService extends BaseApiService {

    constructor(private sbService: SupabaseService) {
        super();
    }

    async getStats(from: Date, to: Date, datasourceIds: number[], cols: string[], metric: string, featureIds?: string[], dimIds?: { [key: string]: string[] }) {
        let query = this.sbService.client
            .from('stats')
            .select(`${cols.join(',')},${metric}:${metric}.sum()`)
            .in('datasource_id', datasourceIds)
            .gte('date', utcDateToLocal(from).toISOString())
            .lte('date', utcDateToLocal(to).toISOString());

        if (featureIds && featureIds.length)
            query = query.in('feature', featureIds);

        if (dimIds)
            for (let propName in dimIds)
                if (dimIds[propName].length)
                    query = query.in(propName, dimIds[propName])

        const respAccumulated = [];
        const step = 10000;
        let start = 0;
        while (true) {
            const resp = (await query.range(start, start + step - 1)).data!;
            respAccumulated.push(...resp);
            start += step;
            if (resp.length < step)
                break;
        }

        return respAccumulated;
    }

    async getFeatureAndValues(orgId: number) {
        return await this.sbService.getFeatureAndValues(orgId);
    }

    async getDimsAndValues(orgId: number) {
        return await this.sbService.getDimsAndValues(orgId);
    }

}