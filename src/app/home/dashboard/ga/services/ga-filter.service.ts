import { Injectable } from '@angular/core';

import { GaMatchType } from '../../../../services/google/ga-data/types/v1beta/ga-filter';
import {
    GaTableConfig,
    GaTableColumnData,
    GaTableFilterControl,
    GaTableFilterState,
} from '../types/table/table';
import { GaColumnType } from '../../../../services/google/ga-data/types/v1beta/ga-column';
import {
    GaFilter,
    GaFilterEndGroup,
    GaFilterExpression,
    GaFilterExpressionList,
    GaStringFilter,
} from '../../../../services/google/ga-data/models/ga-filter';

Injectable();
export class GAFilterService {
    public buildFilterControls(
        cfg?: GaTableConfig,
        data?: GaTableColumnData
    ): GaTableFilterControl[] | null {
        if (!data || !cfg) {
            return null;
        }

        const filters = cfg.filterControlDefinitions.map((f) => {
            return {
                ...f,
                options: [...new Set(data[f.name])],
                emptyValuePlaceHolder:
                    cfg.emptyColDefPlaceholders[f.name] ?? '',
            };
        });

        return filters;
    }

    public buildFilterPayload(
        filterState: GaTableFilterState,
        defaultFilters?: {
            dimensionFilters?: GaFilter[];
            metricFilters?: GaFilter[];
        }
    ): {
        dimensionFilter?: GaFilterExpression;
        metricFilter?: GaFilterExpression;
    } {
        // NOTE:
        // either OrGroup or EndGroup can be used
        // and we use EndGroup by default;

        const dimensionEndGroup = this.initializeFilterEndGroup(
            defaultFilters?.dimensionFilters
        );
        const metricEndGroup = this.initializeFilterEndGroup(
            defaultFilters?.metricFilters
        );

        const processedFilters = Array.from(filterState.values()).reduce(
            (filters, curr) => {
                if (curr.type === GaColumnType.Dimension) {
                    return this.buildDimensionFilter(filters, curr);
                }
                return filters;
            },
            { dimensionFilter: dimensionEndGroup, metricFilter: metricEndGroup }
        );

        const filterOrUndefined = (filterGroup: GaFilterEndGroup) =>
            filterGroup.andGroup.expressions.length > 0
                ? filterGroup
                : undefined;

        return {
            dimensionFilter: filterOrUndefined(
                processedFilters.dimensionFilter
            ),
            metricFilter: filterOrUndefined(processedFilters.metricFilter),
        };
    }

    private initializeFilterEndGroup(defaultFilters?: GaFilter[]) {
        return new GaFilterEndGroup(
            new GaFilterExpressionList([...(defaultFilters ?? [])])
        );
    }

    private buildDimensionFilter(
        prev: {
            dimensionFilter: GaFilterEndGroup;
            metricFilter: GaFilterEndGroup;
        },
        curr: GaTableFilterControl & { value: string }
    ) {
        const { name, value, emptyValuePlaceHolder } = curr;
        const matchType = this.getMatchType(value, emptyValuePlaceHolder);
        const filterValue = this.getValue(value, emptyValuePlaceHolder);

        prev.dimensionFilter.andGroup.expressions.push(
            new GaFilter(
                name,
                new GaStringFilter(matchType, filterValue, false)
            )
        );

        return prev;
    }

    private getMatchType(
        value: string,
        emptyValuePlaceHolder: string
    ): GaMatchType {
        return value === '' || value === emptyValuePlaceHolder
            ? GaMatchType.EXACT
            : this.defaultMatchType;
    }

    private getValue(value: string, emptyValuePlaceHolder: string): string {
        return value === emptyValuePlaceHolder ? '' : value;
    }

    private get defaultMatchType(): GaMatchType {
        return GaMatchType.CONTAINS;
    }
}
