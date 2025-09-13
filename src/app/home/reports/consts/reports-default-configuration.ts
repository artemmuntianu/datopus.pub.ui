import { BQStringFilter, BQMatchType } from '../../../services/google/big-query/models/bq-filter';
import {
    BQDimensionDefinition,
    BQFilterDefinition,
    BQMetricDefinition,
    BQStringFilterDefinition,
    ChartVisual,
    DiagramVisual,
    ReportSettings,
    TableVisual
} from '../features/models/reports-definition';

export const REPORT_VISUALS = {
    chart: [new ChartVisual('bar'), new ChartVisual('column'), new ChartVisual('line')],
    diagram: [new DiagramVisual('sankey')],
    table: [new TableVisual('regular')]
};

export const NEW_REPORT_DEFAULT_CONFIGURATION_SETTINGS: ReportSettings = {
    selectedDiagramMetric: new BQMetricDefinition('Events', 'events'),
    diagramDefinitions: [
        new BQDimensionDefinition('Source Feature', 'prevFeature', true),
        new BQDimensionDefinition('Feature', 'feature', true)
    ],
    selectedDimensions: [
        new BQDimensionDefinition('Feature', 'feature', true),
        new BQDimensionDefinition('Device', 'device.category'),
        new BQDimensionDefinition('Date', 'event_date')
    ],
    selectedMetrics: [new BQMetricDefinition('Events', 'events')],
    selectedChartDimension: new BQDimensionDefinition('Date', 'event_date'),
    selectedChartMetric: new BQMetricDefinition('Events', 'events'),
    selectedDrilldownDimension: new BQDimensionDefinition('Feature', 'feature', true),
    metricFilter: undefined,
    dimensionFilter: undefined,
    selectedVisual: new DiagramVisual('sankey'),
    selectedSort: { desc: true, fieldName: 'event_date' }
};
