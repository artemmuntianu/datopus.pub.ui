import { GaCompatibility } from '../types/v1beta/ga-compatibility';
import { GaDimensionMetaData, GaMetricMetaData } from '../types/v1beta/ga-metadata';

export class GaCheckCompitabilityResp {
    constructor(
        public dimensionCompatibilities?: {
            dimensionMetadata: GaDimensionMetaData;
            compatibility: GaCompatibility;
        }[],
        public metricCompatibilities?: {
            metricMetadata: GaMetricMetaData;
            compatibility: GaCompatibility;
        }[]
    ) {}
}
