import { GaCompatibility } from '../types/v1beta/ga-compatibility';
import { GaDataDimension } from './ga-dimension';
import { GaFilterExpression } from './ga-filter';
import { GaDataMetric } from './ga-metric';

export class GaCheckCompitabilityReq {
    constructor(
        public dimensions?: GaDataDimension[],
        public metrics?: GaDataMetric[],
        public dimensionFilter?: GaFilterExpression | undefined,
        public metricFilter?: GaFilterExpression | undefined,
        public compatibilityFilter?: GaCompatibility
    ) {}
}
