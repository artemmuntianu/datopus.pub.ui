export class BQResponse {
    constructor(public rows?: BQRow[], public schema?: BQTableFieldSchema) {}
}

export type BQValue = string | null | BQStructData;

export interface BQStructData {
    f: { v: BQValue }[];
}


export class BQRow {
    constructor(public f: { v: BQValue }[]) {}
}


export enum BQRoundingMode {
    ROUND_HALF_AWAY_FROM_ZERO = 'ROUND_HALF_AWAY_FROM_ZERO',
    ROUNDING_MODE_UNSPECIFIED = 'ROUNDING_MODE_UNSPECIFIED',
    ROUND_HALF_EVEN = 'ROUND_HALF_EVEN',
}
export type BQTableFieldValueType =
    | 'DATE'
    | 'STRING'
    | 'INTEGER'
    | 'NUMERIC'
    | 'BIGNUMERIC'
    | 'JSON'
    | 'RECORD'
    | 'STRUCT'
    | 'RANGE'
    | 'BYTES'
    | 'FLOAT'
    | 'BOOLEAN'
    | 'TIMESTAMP'
    | 'TIME'
    | 'DATETIME'
    | 'GEOGRAPHY';

export class BQTableFieldSchema {
    constructor(
        public name: string,
        public type: BQTableFieldValueType,
        public mode: string,
        public fields: BQTableFieldSchema[],
        public description: string,
        public policyTags: {
            names: string[];
        },
        public maxLength: string,
        public precision: string,
        public scale: string,
        public roundingMode: BQRoundingMode,
        public collation: string,
        public defaultValueExpression: string,
        public rangeElementType: {
            type: string;
        }
    ) {}
}

// {
//     kind: string,
//     schema: {
//       object (TableSchema)
//     },
//     jobReference: {
//       object (JobReference)
//     },
//     jobCreationReason: {
//       object (JobCreationReason)
//     },
//     queryId: string,
//     totalRows: string,
//     pageToken: string,
//     rows: [
//       {
//         object
//       }
//     ],
//     totalBytesProcessed: string,
//     jobComplete: boolean,
//     errors: [
//       {
//         object (ErrorProto)
//       }
//     ],
//     cacheHit: boolean,
//     numDmlAffectedRows: string,
//     sessionInfo: {
//       object (SessionInfo)
//     },
//     dmlStats: {
//       object (DmlStats)
//     }
//   }
