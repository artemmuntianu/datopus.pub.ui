import { Database } from '../../../../../../database.types';
import {
    BQDateFilter,
    BQNumericFilter,
    BQStringFilter
} from '../../../../services/google/big-query/models/bq-filter';

export class BQFieldDefinition {
    constructor(
        public uiName: string,
        public apiName: string,
        public custom: boolean = false
    ) { }
}

export class BQMetricDefinition extends BQFieldDefinition {
    readonly type = 'metric';
}

export class BQDimensionDefinition extends BQFieldDefinition {
    readonly type = 'dimension';
}

export const VisualTypes = {
    chart: {
        line: 'Line Chart',
        bar: 'Bar Chart',
        funnel: 'Funnel Chart',
        column: 'Column Chart'
    } as const,
    table: {
        regular: 'Table'
    } as const,
    diagram: {
        sankey: 'Flow Diagram'
    } as const
} as const;

export class VisualTypeIcon {
    constructor(
        public uiName: string,
        public uiClass: string = ''
    ) { }
}

export type ChartType = keyof typeof VisualTypes.chart;
export type TableType = keyof typeof VisualTypes.table;
export type DiagramType = keyof typeof VisualTypes.diagram;

export abstract class BaseVisualDefinition<T extends keyof typeof VisualTypes> {
    public readonly label: string;

    constructor(
        public type: T,
        public subtype: keyof (typeof VisualTypes)[T],
        public icon: VisualTypeIcon,
        public options?: Record<string, any>
    ) {
        this.label = VisualTypes[type][subtype] as string;
    }
}

export class ChartVisual extends BaseVisualDefinition<'chart'> {
    constructor(subtype: ChartType, options?: Record<string, any>) {
        let icon;
        switch (subtype) {
            case 'bar':
                icon = new VisualTypeIcon('bar_chart', 'rotate-90');
                break;
            case 'column':
                icon = new VisualTypeIcon('bar_chart');
                break;
            case 'funnel':
                icon = new VisualTypeIcon('signal_cellular_alt');
                break;
            case 'line':
                icon = new VisualTypeIcon('show_chart');
                break;
        }
        super('chart', subtype, icon, options);
    }
}

export class TableVisual extends BaseVisualDefinition<'table'> {
    constructor(subtype: TableType, options?: Record<string, any>) {
        const icon = new VisualTypeIcon('table_chart');
        super('table', subtype, icon, options);
    }
}

export class DiagramVisual extends BaseVisualDefinition<'diagram'> {
    constructor(subtype: DiagramType, options?: Record<string, any>) {
        const icon = new VisualTypeIcon('account_tree');
        super('diagram', subtype, icon, options);
    }
}
export interface BQOrderBy {
    desc: boolean;
    fieldName: string;
}
export type VisualDefinition = ChartVisual | TableVisual | DiagramVisual;

export interface ReportSettings {
    selectedDimensions: BQDimensionDefinition[];
    selectedMetrics: BQMetricDefinition[];
    selectedChartDimension: BQDimensionDefinition;
    selectedDrilldownDimension: BQDimensionDefinition | null;
    selectedChartMetric: BQMetricDefinition;
    selectedDiagramMetric: BQMetricDefinition;
    selectedVisual: VisualDefinition;
    metricFilter?: BQFilterDefinition<'metric'>;
    dimensionFilter?: BQFilterDefinition<'dimension'>;
    selectedSort: BQOrderBy | null;
    diagramDefinitions?: BQDimensionDefinition[];
}

export type Visuals = Record<keyof typeof VisualTypes, VisualDefinition[]>;

export class ReportDefinition {
    constructor(
        public id: number,
        public settings: ReportSettings,
        public orgId?: number,
        public systemName?: string,
        public explanation?: string,
    ) { }

    static fromApi(data: Database['public']['Tables']['visual_definition']['Row']) {
        return new ReportDefinition(
            data.id,
            data.settings as any,
            data.org_id ?? undefined,
            data.system_name ?? undefined,
            data.explanation ?? undefined,
        )
    }
}

export class BQFilterDefinition<T extends 'metric' | 'dimension'> {
    constructor(
        public type: T,
        public filterList: T extends 'metric'
            ? BQNumericFilterDefinition[]
            : (BQStringFilterDefinition | BQDateFilterDefinition)[]
    ) { }
}

export class BQNumericFilterDefinition {
    readonly type = 'numeric';

    constructor(
        public fieldId: string,
        public custom: boolean,
        public filter: BQNumericFilter
    ) { }
}

export class BQStringFilterDefinition {
    readonly type = 'string';

    constructor(
        public fieldId: string,
        public custom: boolean,
        public filter: BQStringFilter
    ) { }
}

export class BQDateFilterDefinition {
    readonly type = 'date';

    constructor(
        public fieldId: string,
        public custom: boolean,
        public filter: BQDateFilter,
        public key?: number,
        public label?: string,
        public dateDiff?: number
    ) { }
}
