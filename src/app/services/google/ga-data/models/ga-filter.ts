import { GaMatchType, GaOperation } from '../types/v1beta/ga-filter';

export class GaFilterExpressionList {
    expressions: GaFilterExpression[];

    constructor(expressions: GaFilterExpression[]) {
        this.expressions = expressions;
    }
}

export class GaStringFilter {
    matchType?: GaMatchType;
    value?: string;
    caseSensitive?: boolean;

    constructor(
        matchType?: GaMatchType,
        value?: string,
        caseSensitive?: boolean
    ) {
        this.matchType = matchType;
        this.value = value;
        this.caseSensitive = caseSensitive;
    }
}

export class GaInListFilter {
    values?: string[];
    caseSensitive?: boolean;

    constructor(values?: string[], caseSensitive?: boolean) {
        this.values = values;
        this.caseSensitive = caseSensitive;
    }
}

export type GaNumericValue = GaNumericDoubleValue | GaNumericIntValue;

export class GaNumericDoubleValue {
    constructor(public doubleValue: number) {}
}

export class GaNumericIntValue {
    constructor(public int64Value: string) {}
}

export class GaNumericFilter {
    operation: GaOperation;
    value: GaNumericValue;

    constructor(operation: GaOperation, value: GaNumericValue) {
        this.operation = operation;
        this.value = value;
    }
}

export class GaBetweenFilter {
    fromValue?: GaNumericValue;
    toValue?: GaNumericValue;

    constructor(fromValue?: GaNumericValue, toValue?: GaNumericValue) {
        this.fromValue = fromValue;
        this.toValue = toValue;
    }
}

export class GaEmptyFilter {}

export class GaFilter {
    public filter: {
        fieldName: string;
        stringFilter?: GaStringFilter;
        inListFilter?: GaInListFilter;
        numericFilter?: GaNumericFilter;
        betweenFilter?: GaBetweenFilter;
        emptyFilter?: GaEmptyFilter;
    };
    constructor(
        fieldName: string,
        filter:
            | GaStringFilter
            | GaInListFilter
            | GaNumericFilter
            | GaBetweenFilter
            | GaEmptyFilter
    ) {
        this.filter = {
            fieldName: fieldName,
        };

        if (filter instanceof GaStringFilter) {
            this.filter.stringFilter = filter;
        } else if (filter instanceof GaInListFilter) {
            this.filter.inListFilter = filter;
        } else if (filter instanceof GaNumericFilter) {
            this.filter.numericFilter = filter;
        } else if (filter instanceof GaBetweenFilter) {
            this.filter.betweenFilter = filter;
        } else if (filter instanceof GaEmptyFilter) {
            this.filter.emptyFilter = filter;
        } else {
            throw new Error('Invalid filter type provided');
        }
    }
}

export class GaFilterEndGroup {
    andGroup: GaFilterExpressionList;

    constructor(andGroup: GaFilterExpressionList) {
        this.andGroup = andGroup;
    }
}

export class GaFilterOrGroup {
    orGroup: GaFilterExpressionList;

    constructor(orGroup: GaFilterExpressionList) {
        this.orGroup = orGroup;
    }
}

export class GaFilterNotExpression {
    expression: GaFilterExpression;

    constructor(expression: GaFilterExpression) {
        this.expression = expression;
    }
}

export type GaFilterExpression =
    | GaFilterEndGroup
    | GaFilterOrGroup
    | GaFilterNotExpression
    | GaFilter;
