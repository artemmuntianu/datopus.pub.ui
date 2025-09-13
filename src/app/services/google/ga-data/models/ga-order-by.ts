import { GaOrderType } from '../types/v1beta/ga-order-by';

export abstract class GaOrderByBase {
    constructor(public desc: boolean) {}
}

export class GaMetricOrderBy extends GaOrderByBase {
    public metric: {
        metricName: string;
    };

    constructor(desc: boolean, metricName: string) {
        super(desc);

        this.metric = {
            metricName,
        };
    }
}

export class GaDimensionOrderBy extends GaOrderByBase {
    public dimension: {
        dimensionName: string;
        orderType: GaOrderType;
    };

    constructor(desc: boolean, dimensionName: string, orderType: GaOrderType) {
        super(desc);

        this.dimension = {
            dimensionName,
            orderType,
        };
    }
}

export class GaPivotOrderBy extends GaOrderByBase {
    public pivot: {
        pivotName: string;
    };

    constructor(desc: boolean, pivotName: string) {
        super(desc);

        this.pivot = {
            pivotName,
        };
    }
}

export type GaOrderBy = GaMetricOrderBy | GaDimensionOrderBy | GaPivotOrderBy;
