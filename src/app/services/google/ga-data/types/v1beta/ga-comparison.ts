import { GaFilterExpression } from "../../models/ga-filter";

export type GaComparison = DefaultComparsion | DimensionFilterComparsion;

export type DimensionFilterComparsion = {
    name?: string;
    dimensionFilter?: GaFilterExpression;
}

export type DefaultComparsion = {
    name?: string;
    comparison?: string;
}
