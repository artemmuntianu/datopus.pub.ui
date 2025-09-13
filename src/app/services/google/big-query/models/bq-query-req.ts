import {
    BQDimensionDefinition,
    BQMetricDefinition,
    BQOrderBy,
} from '../../../../home/reports/features/models/reports-definition';
import { DateRange } from '../../../../shared/types/date-range';
import { BgFilterExpressionPayloadMapper } from '../mappers/bq-filter.mapper';
import {
    BQBetweenFilter,
    BQFilterExpression,
    BQInListFilter,
    BQNumericFilter,
    BQStringFilter,
} from './bq-filter';

export class BQQueryRequest {
    public dimensionFilter?: BQFilterExpressionPayload;
    public metricFilter?: BQFilterExpressionPayload;

    constructor(
        public dateRange: DateRange,
        public dimensions?: BQDimensionDefinition[],
        public metrics?: BQMetricDefinition[],
        dimensionFilter?:  BQFilterExpression<'dimension'>,
        metricFilter?: BQFilterExpression<'metric'>,
        public orderBys?: BQOrderBy[]
    ) {
        const mapper = new BgFilterExpressionPayloadMapper();

        this.dimensionFilter = dimensionFilter ? mapper.transform(dimensionFilter): undefined;
        this.metricFilter = metricFilter ? mapper.transform(metricFilter): undefined;
    }
}

export interface BQFilterExpressionListPayload {
    expressions: BQFilterExpressionPayload[];
}

export interface BQFilterAndGroupPayload {
    andGroup: BQFilterExpressionListPayload;
}

export interface BQFilterOrGroupPayload {
    orGroup: BQFilterExpressionListPayload;
}

export type BQFilterExpressionPayload = BQFilterAndGroupPayload | BQFilterOrGroupPayload | BQFilterPayload;

export interface BQFilterPayload {
    filter: {
        fieldName: string;
        custom: boolean;
        stringFilter?: BQStringFilter;
        inListFilter?: BQInListFilter;
        numericFilter?: BQNumericFilter;
        betweenFilter?: BQBetweenFilter;
    };
}
