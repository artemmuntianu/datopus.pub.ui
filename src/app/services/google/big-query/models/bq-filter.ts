import { DateRange } from '../../../../shared/types/date-range';

export enum BQMatchType {
    MATCH_EXACT = 'MATCH_EXACT',
    NOT_MATCH_EXACT = 'NOT_MATH_EXACT',
    BEGINS_WITH = 'BEGINS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    CONTAINS = 'CONTAINS',
    MATCH_REGEX = 'MATCH_REGEX',
    NOT_MATCH_REGEX = 'NOT_MATCH_REGEX',
}

export enum BQOperation {
    EQUAL = 'EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    LESS_THAN = 'LESS_THAN',
    LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
    GREATER_THAN = 'GREATER_THAN',
    GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
}

export class BQStringFilter {
    matchType: BQMatchType;
    value: string;
    caseSensitive?: boolean;

    constructor(
        matchType: BQMatchType,
        value: string,
        caseSensitive: boolean = false
    ) {
        this.matchType = matchType;
        this.value = value;
        this.caseSensitive = caseSensitive;
    }
}

export class BQInListFilter {
    values?: string[];
    caseSensitive?: boolean;

    constructor(values?: string[], caseSensitive?: boolean) {
        this.values = values;
        this.caseSensitive = caseSensitive;
    }
}

export class BQDateFilter {
    constructor(
        public dateRange: DateRange,
    ) {}
}

export type BQNumericValue = BQNumericDoubleValue | BQNumericIntValue;

export class BQNumericDoubleValue {
    constructor(public doubleValue: number) {}
}

export class BQNumericIntValue {
    constructor(public int64Value: string) {}
}

export class BQNumericFilter {
    operation: BQOperation;
    value: string;

    constructor(operation: BQOperation, value: string) {
        this.operation = operation;
        this.value = value;
    }
}

export class BQBetweenFilter {
    fromValue: number;
    toValue: number;

    constructor(fromValue: number, toValue: number) {
        this.fromValue = fromValue;
        this.toValue = toValue;
    }
}

export class BQFilter<T extends 'metric' | 'dimension'> {
    constructor(
        public fieldName: string,
        public custom: boolean,
        public type: "numeric" | "string" | "date" | "between",
        public filter: T extends 'metric'
            ? BQNumericFilter | BQBetweenFilter
            : BQStringFilter | BQDateFilter
    ) {}
}

export class BQFilterExpressionList<T extends 'metric' | 'dimension'> {
    expressions: BQFilterExpression<T>[];

    constructor(expressions: BQFilterExpression<T>[]) {
        this.expressions = expressions;
    }
}

export class BQFilterAndGroup<T extends 'metric' | 'dimension'> {
    andGroup: BQFilterExpressionList<T>;

    constructor(andGroup: BQFilterExpressionList<T>) {
        this.andGroup = andGroup;
    }
}

export class BQFilterOrGroup<T extends 'metric' | 'dimension'> {
    orGroup: BQFilterExpressionList<T>;

    constructor(orGroup: BQFilterExpressionList<T>) {
        this.orGroup = orGroup;
    }
}

export class BQFilterNotExpression<T extends 'metric' | 'dimension'> {
    expression: BQFilterExpression<T>;

    constructor(expression: BQFilterExpression<T>) {
        this.expression = expression;
    }
}

export type BQFilterExpression<T extends 'metric' | 'dimension'> =
    | BQFilterAndGroup<T>
    | BQFilterOrGroup<T>
    | BQFilter<T>;
