import { Injectable } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { GoogleOAuth2TokenResp } from '../google/google-auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { BaseApiService } from './base-api.service';
import { DatasourceTable } from './models';
import { Authtoken } from './models/authToken';

@Injectable({
    providedIn: 'root'
})
export class ConnectionsService extends BaseApiService {

    constructor(private sbService: SupabaseService) {
        super();
    }

    async addDatasource(table: DatasourceTable, orgId: number): Promise<PostgrestError | null> {
        const orgField = table === DatasourceTable.GoogleAnalytics ? 'datasource_id' : 'big_query_datasource_id';

        const resp1 = await this.sbService.client
            .from(table)
            .insert({ auth_step: 'step1', org_id: orgId })
            .select('id');

        if (resp1.error) return resp1.error;

        const resp2 = await this.sbService.updateOrg(orgId, { [orgField]: resp1.data[0].id });

        return resp2.error || null;
    }

    async addAuthToken(datasourceId: number, type: DatasourceTable, datasourceFields: any, tokenData: GoogleOAuth2TokenResp) {
        const resp1 = await this.sbService.insertAuthToken(tokenData);
        if (resp1.error) return resp1.error;

        datasourceFields = { ...datasourceFields, auth_token_id: resp1.data[0].id };

        const resp2 = await this.sbService.updateDatasource(datasourceId, type, datasourceFields);
        if (resp2.error) return resp2.error;

        return new Authtoken(resp1.data[0]);
    }
}
