import { DimensionValue } from "./ga-dimension";
import { MetricValue } from "./ga-metric";

export interface Row {
	dimensionValues?: DimensionValue[];
	metricValues?: MetricValue[];
}
