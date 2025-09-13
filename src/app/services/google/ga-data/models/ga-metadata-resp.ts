import { GaDimensionMetaData, GaMetricMetaData, ComparisonMetaData } from "../types/v1beta/ga-metadata";

export class GaMetadata {
    constructor(
      public dimensions: GaDimensionMetaData[],
      public metrics: GaMetricMetaData[],
      public comparisons?: ComparisonMetaData[],
      public name?: string,
    ) {}
  }
