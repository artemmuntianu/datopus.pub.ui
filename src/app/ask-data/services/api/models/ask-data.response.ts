import { ChartType } from "../../../../home/shared/chart/chart.component";
import { BQResponse, BQTableFieldSchema } from "../../../../services/google/big-query/models/bq-query-resp";

export class AksDataResponse {
    public constructor(
        public sql: string,
        public supported_view_candidates: string[] | string,
        public chart_config?: {
            supported_types?: string[] | string;
            x_axis?: string;
            y_axis?: string[] | string;
            z_axis?: string;
        },
        public table_columns?: string[],
		public data?: BQResponse,
        public explanation?: string,
        public skip_sql?: boolean
    ) {}
}


export class AksParsedDataContext {
    public constructor(
        public sql: string,
        public supported_view_candidates: string[],
        public chart_config?: {
            supported_types?: ChartType[];
            x_axis?: string;
            y_axis?: string[];
            z_axis?: string;
        },
        public table_columns?: string[],
        public data?: Record<string, any>[],
        public schema?: BQTableFieldSchema,
        public explanation?: string,
        public ignore_data?: boolean
    ) {}
}