import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/api/auth.service';
import { BQMapper } from '../../../services/google/big-query/mappers/bq-rows.mapper';
import { env } from '../../../../environments/environment';
import { AksDataResponse, AksParsedDataContext } from './models/ask-data.response';
import { AskDataRequest } from './models/ask-data.request';
import { ChartType } from '../../../home/shared/chart/chart.component';

@Injectable({
    providedIn: 'root'
})
export class AskDataApiService {
    private readonly httpClient = inject(HttpClient);
    private readonly authService = inject(AuthService);

    private readonly baseApiUrl = env.apiBaseUrl;
    private readonly endpointUrl = `${this.baseApiUrl}/bigquery`;

    public async askData(
        request: AskDataRequest,
        projectInfo: {
            projectId: string;
            propertyId: string;
            tableId: string;
        }
    ) {
        const response = await firstValueFrom(
            this.httpClient.post<AksDataResponse>(
                `${this.endpointUrl}/${projectInfo.projectId}/${projectInfo.propertyId}/${projectInfo.tableId}*/nlq`,
                request,
                {
                    headers: {
                        Authorization: `Bearer ${this.authService.getAccessToken()}`
                    }
                }
            )
        );

        const parsedData = new AksParsedDataContext(
            response.sql,
            Array.isArray(response.supported_view_candidates)
                ? response.supported_view_candidates
                : [response.supported_view_candidates],
            {
                supported_types: Array.isArray(response.chart_config?.supported_types)
                    ? response.chart_config?.supported_types as any
                    : [response.chart_config?.supported_types ?? 'bar'],
                x_axis: BQMapper.getActualColumnName(
                    response.chart_config?.x_axis,
                    response.data?.schema
                ),
                y_axis: Array.isArray(response.chart_config?.y_axis)
                    ? (response.chart_config.y_axis
                          ?.map(yName => BQMapper.getActualColumnName(yName, response.data?.schema))
                          .filter(v => !!v) as string[])
                    : response.chart_config?.y_axis
                      ? ([
                            BQMapper.getActualColumnName(
                                response.chart_config.y_axis,
                                response.data?.schema
                            )
                        ].filter(v => !!v) as string[])
                      : undefined,
                z_axis: BQMapper.getActualColumnName(
                    response.chart_config?.z_axis,
                    response.data?.schema
                )
            },
            response.table_columns
                ?.map(colName => BQMapper.getActualColumnName(colName, response.data?.schema))
                .filter(v => !!v) as string[],
            response.data ? BQMapper.map<Record<string, any>>(response.data) : undefined,
            response.data?.schema,
            response.explanation,
            response.skip_sql
        );
        if (this.validateResponse(parsedData)) {
            return parsedData;
        } else {
            throw new Error('Unable to parse valid response');
        }
    }
    
    private validateResponse(response: AksParsedDataContext): boolean {
        const chartTypes: ChartType[] = ["bar", "line", "funnel", "column"];

        if (response.ignore_data === false) {
            if (!response.supported_view_candidates) {
                return false;
            }

            const validCandidates: ('chart' | 'table')[] = [];

            for (const candidate of response.supported_view_candidates) {
                if (candidate === 'chart') {
                    const supportedTypes = response.chart_config?.supported_types?.filter((type)=> {
                        return chartTypes.includes(type as any);
                    }) || [];

                    if (
                        supportedTypes.length > 0 &&
                        response.chart_config?.x_axis &&
                        (response.chart_config?.y_axis?.length ?? 0) > 0
                    ) {
                        response.chart_config.supported_types = supportedTypes;
                        validCandidates.push('chart');
                    }
                } else if (candidate === 'table') {
                    if ((response.table_columns?.length ?? 0) > 0) {
                        validCandidates.push('table');
                    }
                }
            }
            response.supported_view_candidates.length = 0;
            response.supported_view_candidates.push(...validCandidates);
            return response.supported_view_candidates.length > 0;
        }
        return true;
    }
}
