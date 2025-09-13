import { inject, Injectable } from '@angular/core';
import { GaMappingService } from './ga-mapping.service';
import { Sort } from '@angular/material/sort';
import { GaMetadata } from '../../../../services/google/ga-data/models/ga-metadata-resp';
import { GaTableSort } from '../types/table/table';
import { GaColumnType } from '../../../../services/google/ga-data/types/v1beta/ga-column';
import {
    GaDimensionOrderBy,
    GaMetricOrderBy,
    GaOrderBy,
} from '../../../../services/google/ga-data/models/ga-order-by';
import { GaOrderType } from '../../../../services/google/ga-data/types/v1beta/ga-order-by';

Injectable();
export class GaTableSortService {
    private readonly gaMappingService = inject(GaMappingService);

    public createTableSortSettingsfromDefinition(sort: GaTableSort): {
        defaultColumn: string;
        defaultDirection: 'desc' | 'asc';
    } | null {
        if (!sort) return null;

        return {
            defaultColumn: this.gaMappingService.mapGaDefinitionToUi(
                sort.apiName
            ),
            defaultDirection: sort.order,
        };
    }

    public buildGaSort(sort: GaTableSort | null): GaOrderBy | null {
        if (sort === null) return null;

        switch (sort.type) {
            case GaColumnType.Dimension:
                return new GaDimensionOrderBy(
                    sort.order === 'desc',
                    sort.apiName,
                    GaOrderType.ALPHANUMERIC
                );
            case GaColumnType.Metric:
                return new GaMetricOrderBy(sort.order === 'desc', sort.apiName);
            default:
                return null;
        }
    }

    public buildGaTableSort(
        sort: Sort,
        metadata: GaMetadata | null
    ): GaTableSort | null {
        const apiName = this.gaMappingService.mapUiToGaDefinition(sort.active);

        if (!metadata) return null;

        const dimension = metadata.dimensions.find(
            (d) => d.apiName === apiName
        );

        if (dimension) {
            return {
                apiName,
                order: sort.direction === 'desc' ? 'desc' : 'asc',
                type: GaColumnType.Dimension,
            };
        }

        const metric = metadata.metrics.find((d) => d.apiName === apiName);

        if (metric) {
            return {
                apiName,
                order: sort.direction === 'desc' ? 'desc' : 'asc',
                type: GaColumnType.Metric,
            };
        }

        return null;
    }
}
