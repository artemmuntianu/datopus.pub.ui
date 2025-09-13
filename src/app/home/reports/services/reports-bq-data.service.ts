import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { BaseApiService } from '../../../services/api/base-api.service';
import { DateRange } from '../../../shared/types/date-range';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { env } from '../../../../environments/environment';
import { BQDatasource } from '../../../services/api/models';
import {
    BQDimensionDefinition,
    BQFilterDefinition,
    BQMetricDefinition,
    BQOrderBy
} from '../features/models/reports-definition';
import { distinct } from '../../../shared/utils/distinct';
import {
    BQDateFilter,
    BQFilter,
    BQFilterAndGroup,
    BQFilterExpression,
    BQFilterExpressionList
} from '../../../services/google/big-query/models/bq-filter';
import { BQQueryRequest } from '../../../services/google/big-query/models/bq-query-req';
import { BQResponse } from '../../../services/google/big-query/models/bq-query-resp';
import { BQApiError, BQApiErrorCode } from '../../../services/google/big-query/models/bq-error';
import { AuthService } from '../../../services/api/auth.service';

@Injectable({ providedIn: 'root' })
export class ReportsBQDataService extends BaseApiService {
    private readonly httpClient = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly apiBaseUrl = env.apiBaseUrl;
    private readonly tableId = 'events';

    private async queryApi(
        datasource: BQDatasource,
        dimensions: BQDimensionDefinition[],
        metrics: BQMetricDefinition[],
        dateRange: DateRange,
        tableId: string,
        metricFilters?: BQFilterExpression<'metric'>,
        dimensionFilters?: BQFilterExpression<'dimension'>,
        orderBys?: BQOrderBy[]
    ): Promise<BQResponse> {
        if (!datasource.dataset_id) {
            throw new BQApiError(BQApiErrorCode.NO_DATASET, 'No dataset found');
        }

        if (!datasource.project_id) {
            throw new BQApiError(BQApiErrorCode.NO_PROJECT_ID, 'No project id found');
        }

        const payload = new BQQueryRequest(
            dateRange,
            dimensions,
            metrics,
            dimensionFilters,
            metricFilters,
            orderBys
        );

        const url = `${this.apiBaseUrl}/bigquery/${datasource.project_id}/${datasource.dataset_id}/${tableId}`;

        return firstValueFrom(
            this.httpClient
                .post<BQResponse>(url, payload, {
                    headers: {
                        Authorization: `Bearer ${this.authService.getAccessToken()}`
                    }
                })
                .pipe(
                    catchError(err => {
                        if (err instanceof HttpErrorResponse) {
                            if (err.status === HttpStatusCode.Forbidden) {
                                return throwError(
                                    () =>
                                        new BQApiError(
                                            BQApiErrorCode.FORBIDDEN,
                                            'The requested resource is forbidden'
                                        )
                                );
                            } else if (err.status === HttpStatusCode.Unauthorized) {
                                return throwError(
                                    () =>
                                        new BQApiError(
                                            BQApiErrorCode.UNAUTHORIZED,
                                            'Unable to fetch resource due to auth issue'
                                        )
                                );
                            } else {
                                return throwError(
                                    () => new BQApiError(BQApiErrorCode.HTTP_ERROR, 'HTTP error')
                                );
                            }
                        }

                        return throwError(() => err);
                    })
                )
        );
    }

    public async getStats(
        datasource: BQDatasource,
        {
            dateRange,
            metrics = [],
            dimensions = [],
            dimensionFilter,
            metricFilter,
            orderBys,
            options
        }: {
            dateRange: DateRange;
            metrics?: BQMetricDefinition[];
            dimensions?: BQDimensionDefinition[];
            dimensionFilter?: BQFilterDefinition<'dimension'>;
            metricFilter?: BQFilterDefinition<'metric'>;
            orderBys?: BQOrderBy[];
            options?: {
                mapKey?: 'apiName' | 'uiName';
            };
        }
    ): Promise<Record<string, string | number>[]> {
        if (!metrics.length && !dimensions.length) {
            return [];
        }
        const dateRangeOverride = this.parseDateRangeFromFilter(dimensionFilter);

        if (dateRangeOverride) {
            dateRange = dateRangeOverride;
        }

        const dimensionFilterExpression = this.constructEndFilterExpression(dimensionFilter);
        const metricFilterExpression = this.constructEndFilterExpression(metricFilter);

        const uniqueDimensions = distinct(dimensions, 'apiName');

        const response = await this.queryApi(
            datasource,
            uniqueDimensions,
            metrics,
            dateRange,
            this.tableId,
            metricFilterExpression,
            dimensionFilterExpression,
            orderBys
        );

        const rows = response?.rows || [];
        const fieldsSchema = response.schema?.fields;

        const definitions = [...uniqueDimensions, ...metrics];
        // TODO:
        // Use BQMapper, move out empty value handling to representation level
        return rows.map(row => {
            if (row.f.length > definitions.length) {
                throw new BQApiError(
                    BQApiErrorCode.FIELD_COUNT_MISMATCH,
                    'Unexpected Error. Field count mismatch',
                    `Can't map response to keys: received ${row.f.length}, expected ${definitions.length}`
                );
            }

            return row.f.reduce(
                (result, field, index) => {
                    const fieldSchema = fieldsSchema?.[index];

                    const definition = definitions[index];

                    const key = this.shouldUseCustomKey(
                        definition.apiName,
                        options?.mapKey,
                        fieldSchema?.name
                    )
                        ? definition[options!.mapKey!]
                        : (fieldSchema?.name ?? definition.apiName);
                    const value = field.v as any;

                    result[key.replaceAll('__', '.')] =
                        definition instanceof BQMetricDefinition
                            ? Number(value) || 0
                            : (!!value ? value : definition.apiName == 'prevFeature' ? '$web': '');
                    return result;
                },
                {} as Record<string, string | number>
            );
        });
    }

    private shouldUseCustomKey(
        definitionApiName: string,
        mapKey?: keyof BQDimensionDefinition | keyof BQMetricDefinition,
        schemaName?: string
    ) {
        return !!mapKey && this.normalizeFieldName(definitionApiName) === schemaName;
    }

    // schema returns names with replace dots by underscore
    // because sql doesn't support aliases with dots
    private normalizeFieldName(fieldName: string): string {
        return fieldName.replaceAll('.', '__');
    }

    // until view does not support expression construction
    // we create end expression by default
    private constructEndFilterExpression<T extends 'dimension' | 'metric'>(
        filterDefinition?: BQFilterDefinition<T>
    ) {
        const dimensionFilters =
            filterDefinition?.filterList.map(
                f => new BQFilter(f.fieldId, f.custom, f.type, f.filter)
            ) || [];

        return dimensionFilters.length
            ? new BQFilterAndGroup<T>(new BQFilterExpressionList(dimensionFilters))
            : undefined;
    }

    private parseDateRangeFromFilter(filterDefinition?: BQFilterDefinition<'dimension'>) {
        const dateFilterIndex = filterDefinition?.filterList.findIndex(
            d => d.fieldId === 'event_date'
        );

        if (dateFilterIndex !== undefined && dateFilterIndex !== -1) {
            const dateFilterDef = filterDefinition!.filterList.splice(dateFilterIndex, 1)[0];
            return (dateFilterDef!.filter as BQDateFilter).dateRange;
        }

        return null;
    }
}
