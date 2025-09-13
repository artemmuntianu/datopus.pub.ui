import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { BaseApiService } from './base-api.service';

@Injectable({
    providedIn: 'root'
})
export class ReportsExternalsService extends BaseApiService {

    constructor(private sbService: SupabaseService) {
        super();
    }

    async getByPartnerOrgId(partnerOrgId: number) {
        return await this.sbService.client
            .from('external_report')
            .select(`
                id,
                title,
                url,
                icon,
                is_published
            `)
            .eq('partner_org_id', partnerOrgId)
            .order('title');
    }

    async getByOrgId(orgId: number) {
        return await this.sbService.client
            .from('external_report')
            .select(`
                id,
                title,
                url,
                icon,
                is_published
            `)
            .eq('org_id', orgId)
            .order('title');
    }

    async add(orgId: number, partnerOrgId: number | undefined, title: string, url: string, icon: string | null) {
        return await this.sbService.client
            .from('external_report')
            .insert({
                org_id: orgId,
                partner_org_id: partnerOrgId,
                title: title,
                url: url,
                icon: icon,
                is_published: false
            })
            .select(`
                id,
                title,
                url,
                icon,
                is_published
            `);
    }

    async setIsPublished(reportId: number, newVal: boolean) {
        return await this.sbService.client
            .from('external_report')
            .update({ is_published: newVal })
            .eq('id', reportId);
    }

}