import { GaFilter } from '../../../../../services/google/ga-data/models/ga-filter';
import { GaRequestType } from '../../../../../services/google/ga-data/models/ga-request';
import { GaColumnType } from '../../../../../services/google/ga-data/types/v1beta/ga-column';
import { TableValueFormatterSettings } from '../../../../shared/table-tile/formaters/table-value-formatter-settings';

export type TableRowData = { [columnName: string]: string };
export type GaTableDatasource = TableRowData[];

export interface GaTableSort {
    apiName: string;
    order: 'desc' | 'asc';
    type: GaColumnType;
}

export interface GaTableDefinition {
    id: number;
    requestType: GaRequestType;
    title: string;
    description: string;
    columns: {
        dimensions: {
            name: string;
            removeable: boolean;
        }[];
        metrics: {
            name: string;
            removeable: boolean;
        }[];
    };
    config: GaTableConfig;
}

export interface GaTableColumnDefinition {
    name: string;
    formatterSettings?: TableValueFormatterSettings;
}

export interface GaTableConfig {
    filterControlDefinitions: GaTableFilterControlDefinition[];
    limit: number;
    sort?: GaTableSort;
    filters?: {
        dimensionFilters?: GaFilter[];
        metricFilters?: GaFilter[];
    };
    emptyColDefPlaceholders: { [colDefName: string]: string };
}

export type GaTableFilterControlDefinition = {
    filterLabel: string;
    name: string;
    type: GaColumnType;
};

export type GaTableFilterControl = GaTableFilterControlDefinition & {
    emptyValuePlaceHolder: string;
    options: string[];
};

export type GaTableData = {
    columnDefinitions: GaTableColumnDefinition[];
    rowsData: GaTableDatasource;
    columnData: GaTableColumnData;
};

export type GaTableFilterState = Map<
    string,
    GaTableFilterControl & { value: string }
>;

export type GaTableColumnData = {
    [columnName: string]: string[];
};
