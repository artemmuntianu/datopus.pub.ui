import { RequestPayloadMapper } from '../../../api/common/request-mapper';
import {
    BQFilter,
    BQStringFilter,
    BQInListFilter,
    BQNumericFilter,
    BQBetweenFilter,
    BQFilterExpressionList,
    BQFilterExpression,
    BQFilterAndGroup,
    BQFilterOrGroup,
} from '../models/bq-filter';
import {
    BQFilterAndGroupPayload,
    BQFilterExpressionListPayload,
    BQFilterExpressionPayload,
    BQFilterOrGroupPayload,
    BQFilterPayload,
} from '../models/bq-query-req';

class BQFilterPayloadMapper<T extends 'metric' | 'dimension'>
    implements RequestPayloadMapper<BQFilter<T>, BQFilterPayload>
{
    transform(filter: BQFilter<T>): BQFilterPayload {
        return {
            filter: {
                custom: filter.custom,
                fieldName: filter.fieldName,
                stringFilter:
                    filter.type === "string"
                        ? filter.filter as BQStringFilter
                        : undefined,
                numericFilter:
                    filter.type === "numeric"
                        ? filter.filter as BQNumericFilter
                        : undefined,
                betweenFilter:
                    filter.type === "between"
                        ? filter.filter as BQBetweenFilter
                        : undefined,
            },
        };
    }
}

export class BQFilterExpressionListPayloadMapper<
    T extends 'metric' | 'dimension'
> implements
        RequestPayloadMapper<
            BQFilterExpressionList<T>,
            BQFilterExpressionListPayload
        >
{
    transform(expressionList: BQFilterExpressionList<T>) {
        const expressionMapper = new BgFilterExpressionPayloadMapper();
        return {
            expressions: expressionList.expressions.map((expression) =>
                expressionMapper.transform(expression)
            ),
        };
    }
}

export class BgFilterExpressionPayloadMapper<T extends 'metric' | 'dimension'>
    implements RequestPayloadMapper<BQFilter<T>, BQFilterExpressionPayload>
{
    public transform(
        expression: BQFilterExpression<T>
    ): BQFilterExpressionPayload {
        if (expression instanceof BQFilterAndGroup) {
            return new BQFilterAndGroupPayloadMapper().transform(expression);
        } else if (expression instanceof BQFilterOrGroup) {
            return new BQFilterOrGroupPayloadMapper().transform(expression);
        } else if (expression instanceof BQFilter) {
            return new BQFilterPayloadMapper().transform(expression);
        }
        throw new Error('Unsupported expression type');
    }
}

class BQFilterAndGroupPayloadMapper<T extends 'metric' | 'dimension'>
    implements
        RequestPayloadMapper<BQFilterAndGroup<T>, BQFilterAndGroupPayload>
{
    transform(endGroup: BQFilterAndGroup<T>) {
        return {
            andGroup: new BQFilterExpressionListPayloadMapper().transform(
                endGroup.andGroup
            ),
        };
    }
}

class BQFilterOrGroupPayloadMapper<T extends 'metric' | 'dimension'>
    implements RequestPayloadMapper<BQFilterOrGroup<T>, BQFilterOrGroupPayload>
{
    transform(orGroup: BQFilterOrGroup<T>) {
        return {
            orGroup: new BQFilterExpressionListPayloadMapper().transform(
                orGroup.orGroup
            ),
        };
    }
}
