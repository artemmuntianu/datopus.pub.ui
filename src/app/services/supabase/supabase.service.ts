import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../database.types';
import { BQDatasource, DatasourceTable } from '../api/models';
import { BQApiError, BQApiErrorCode } from '../google/big-query/models/bq-error';
import { GoogleOAuth2TokenResp } from '../google/google-auth.service';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    client: SupabaseClient<Database>;

    constructor() {
        const supabaseUrl = 'https://vqetvtgvpvvecktdmvfu.supabase.co';
        const supabaseKey =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZXR2dGd2cHZ2ZWNrdGRtdmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4NDY3MTQsImV4cCI6MjA0MDQyMjcxNH0.rJPH9pTmjrGWdD3RrGjaKSsSknO5pYT2AFPhb2rD78g';
        this.client = createClient<Database>(supabaseUrl, supabaseKey);
    }

    getPartnerOrgs(orgId: number) {
        return this.client
            .from('partner_org')
            .select(
                `
                id,
                name,
                datasource_id
            `
            )
            .eq('org_id', orgId)
            .order('name');
    }

    getOrg(id: number, includes?: string[]) {
        const org = `id, name, datasource_id, big_query_datasource_id, type {datasource} {big_query_datasource}`;
        const bq_datasource = `big_query_datasource!org_big_query_datasource_id_fkey(id, auth_token_id,auth_step, created_at, dataset_id, project_id {auth_token})`;
        const datasource = `
            datasource!org_datasource_id_fkey(
                id,
                ga_property_id,
                ga_measurement_id,
                unique_id,
                auth_token_id,
                auth_step
                {auth_token}
            )`;
        const auth_token = `
            auth_token(
                id,
                access_token,
                refresh_token,
                expires_on
            )`;

        let query = org;

        if (includes) {
            for (const x of includes) {
                switch (x) {
                    case 'datasource':
                        query = query.replace('{datasource}', `, ${datasource}`);
                        break;
                    case 'big_query_datasource':
                        query = query.replace('{big_query_datasource}', `, ${bq_datasource}`);
                        break;
                    case 'auth_token':
                        query = query.replace('{auth_token}', `, ${auth_token}`);
                        break;
                }
            }
        }

        query = query.replace(/,\s*{[^}]+}/g, '');
        query = query.replace(/{[^}]+}/g, '');

        return this.client.from('org').select(query).eq('id', id);
    }

    getBQDimensionDefinition() {
        return this.client.from('big_query_dimension').select(`ui_name,api_name,custom`);
    }

    getBQMetricDefinition() {
        return this.client.from('big_query_metric').select(`
            ui_name,
            api_name,
            custom
            `);
    }

    async getBQDatasourceByOrg(orgId: number, includes?: string[]) {
        let query =
            'big_query_datasource!org_big_query_datasource_id_fkey(id, auth_token_id, created_at, dataset_id, project_id {auth_token})';
        const auth_token = `
        auth_token(
            id,
            access_token,
            refresh_token,
            expires_on
        )`;
        if (includes)
            for (const x of includes)
                switch (x) {
                    case 'auth_token':
                        query = query.replace('{auth_token}', `,${auth_token}`);
                        break;
                }
        query = query.replace(/{auth_token}/i, '');
        let build = this.client.from('org').select(query).eq('id', orgId).single() as any;

        const { data, error } = await build;

        if (error || !data) {
            throw new BQApiError(
                BQApiErrorCode.NO_DATASOURCE,
                `Datasource not found for orgId ${orgId}`
            );
        }

        return data.big_query_datasource as unknown as BQDatasource | null;
    }

    getDims(orgId: number) {
        return this.client
            .from('dimension')
            .select(
                `
                ui_name,
                col_name
            `
            )
            .eq('org_id', orgId)
            .order('ui_name');
    }

    getDimsAndValues(orgId: number) {
        return this.client
            .from('dimension')
            .select(
                `
                ui_name,
                col_name,
                dimension_value(
                    value
                )
            `
            )
            .eq('org_id', orgId)
            .like('col_name', '%dim%')
            .order('ui_name');
    }

    getFeatureAndValues(orgId: number) {
        return this.client
            .from('dimension')
            .select(
                `
                ui_name,
                col_name,
                dimension_value(
                    value
                )
            `
            )
            .match({ org_id: orgId, col_name: 'feature' })
            .limit(1);
    }

    async getDatasource(id: number, includes?: string[]) {
        const datasource = `
                id,
                created_at,
                ga_property_id,
                ga_measurement_id,
                unique_id,
                auth_token_id,
                auth_step
                {auth_token}
            `;
        const auth_token = `
            auth_token(
                id,
                access_token,
                refresh_token,
                expires_on
            )`;

        let query = datasource;
        if (includes)
            for (const x of includes)
                switch (x) {
                    case 'auth_token':
                        query = query.replace('{auth_token}', `,${auth_token}`);
                        break;
                }
        query = query.replace(/{auth_token}/i, '');

        return this.client.from('datasource').select(query).eq('id', id).limit(1);
    }

    updateDatasource(id: number, table: DatasourceTable, fields: any) {
        return this.client.from(table).update(fields).eq('id', id);
    }

    deleteDatasource(id: number, table: DatasourceTable) {
        if (table === DatasourceTable.BigQuery) {
            return this.client.rpc('delete_big_query_datasource_safe', { p_id: id });
        } else {
            return this.client.from(table).delete().eq('id', id);
        }
    }

    updateOrg(id: number, fields: any) {
        return this.client.from('org').update(fields).eq('id', id);
    }

    insertAuthToken(tokenData: GoogleOAuth2TokenResp) {
        const expiresInMs = tokenData.expiresInSeconds * 1000;
        const expiresOn = new Date(Date.now() + expiresInMs).toISOString();
        return this.client.from('auth_token').insert({
            access_token: tokenData.accessToken,
            refresh_token: tokenData.refreshToken,
            expires_on: expiresOn
        }).select(`
                id,
                access_token,
                refresh_token,
                expires_on
            `);
    }

    async getOnboardingProgress(orgId: number) {
        return await this.client
            .from('onboarding_progress')
            .select('*')
            .eq('org_id', orgId)
            .single();
    }

    async completeOnboardingStep(orgId: number, stepId: string) {
        const updateField = `${stepId.replace(/-/g, '_')}_completed_at`;
        const { error } = await this.client
            .from('onboarding_progress')
            .update({ [updateField]: new Date().toISOString() })
            .eq('org_id', orgId);

        if (error) {
            throw error;
        }
    }
}
