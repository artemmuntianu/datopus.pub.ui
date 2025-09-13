export class BQTableReference {
    constructor(
        public projectId: string,
        public datasetId: string,
        public tableId: string
    ) { }
}

export class BQTimePartitioning {
    constructor(
        public type: string,
        public expirationMs: string,
        public field: string,
        public requirePartitionFilter: boolean
    ) { }
}

export class BQRangePartitioning {
    constructor(
        public field: string,
        public range: { start: string; end: string; interval: string }
    ) { }
}

export class BQHivePartitioningOptions {
    constructor(
        public mode: string,
        public sourceUriPrefix: string,
        public requirePartitionFilter: boolean,
        public fields: string[]
    ) { }
}

export class BQClustering {
    constructor(public fields: string[]) { }
}

export class BQAggregationThresholdPolicy {
    constructor(public privacyUnitColumns: string[], public threshold: string) { }
}

export class BQPrivacyPolicy {
    constructor(public aggregationThresholdPolicy: BQAggregationThresholdPolicy) { }
}

export class BQView {
    constructor(public useLegacySql: boolean, public privacyPolicy: BQPrivacyPolicy) { }
}

export class BQTable {
    constructor(
        public kind: string,
        public id: string,
        public tableReference: BQTableReference,
        public friendlyName: string,
        public type: string,
        public timePartitioning?: BQTimePartitioning,
        public rangePartitioning?: BQRangePartitioning,
        public clustering?: BQClustering,
        public hivePartitioningOptions?: BQHivePartitioningOptions,
        public labels?: Record<string, string>,
        public view?: BQView,
        public creationTime?: string,
        public expirationTime?: string,
        public requirePartitionFilter?: boolean
    ) { }
}

export class BQTablesList {
    constructor(
        public kind: string,
        public etag: string,
        public nextPageToken: string,
        public tables: BQTable[],
        public totalItems: number
    ) { }
}