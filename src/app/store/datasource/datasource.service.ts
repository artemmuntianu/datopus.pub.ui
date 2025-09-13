import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../services/supabase/supabase.service';

import { BQDatasource, Datasource } from '../../services/api/models';
import { BQApiError, BQApiErrorCode } from '../../services/google/big-query/models/bq-error';
import { GAApiError, GAApiErrorCode } from '../../services/google/ga-data/models/ga-api-error';

@Injectable({ providedIn: 'root' })
export class DatasourceService {
    sbService = inject(SupabaseService);

    async fetchBQDatasource(orgId: number): Promise<BQDatasource> {
        try {
            const dataSource = await this.sbService.getBQDatasourceByOrg(orgId, ['auth_token']);

            if (dataSource === null) {
                throw new BQApiError(
                    BQApiErrorCode.NO_DATASOURCE,
                    'Failed to fetch Big Query datasource'
                );
            }

            if (!dataSource.auth_token) {
                throw new BQApiError(
                    BQApiErrorCode.NO_ACCESS_TOKEN,
                    'Failed to fetch Big Query datasource access token'
                );
            }

            return dataSource;
        } catch (error) {
            throw new BQApiError(
                BQApiErrorCode.NO_DATASOURCE,
                'Failed to fetch Big Query datasource'
            );
        }
    }

    async fetchGADatasource(orgId: number): Promise<Datasource> {
        const { data, error } = await this.sbService.client
            .from('org')
            .select('datasource(*, auth_token(*))')
            .eq('id', orgId)
            .single();

        if (error || data === null) {
            throw new GAApiError(
                GAApiErrorCode.NO_DATASOURCE,
                'Failed to fetch Google Analytics datasource'
            );
        }

        const source = new Datasource(data.datasource);

        if (source.auth_token === null || source.auth_token === undefined) {
            throw new GAApiError(
                GAApiErrorCode.NO_DATASOURCE,
                'Failed to fetch Google Analytics datasource'
            );
        }

        return source;
    }
}
