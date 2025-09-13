import { inject, Injectable, signal } from '@angular/core';
import { UserMessages } from '../../../../consts';
import { Datasource } from '../../../../services/api/models';
import {
    GaDataDimension,
    GaDataMetric,
    GaDataRunReportReq
} from '../../../../services/google/ga-data/models';
import { GaRequest, GaRequestType } from '../../../../services/google/ga-data/models/ga-request';
import { GADataService } from '../../../../services/google/ga-data/ga-data.service';
import { produce } from 'immer';
import { GaColumnGroup } from '../ga-table/ga-column-selection/ga-column-selection.component';
import { GaTableColumnDefinition, GaTableData, GaTableDefinition } from '../types/table/table';
import { GaColumnType } from '../../../../services/google/ga-data/types/v1beta/ga-column';
import { GaCheckCompitabilityReq } from '../../../../services/google/ga-data/models/ga-check-compitability-req';
import { GaMetadata } from '../../../../services/google/ga-data/models/ga-metadata-resp';
import { GaCompatibility } from '../../../../services/google/ga-data/types/v1beta/ga-compatibility';
import {
    GaMetricMetaData,
    GaDimensionMetaData
} from '../../../../services/google/ga-data/types/v1beta/ga-metadata';
import { GaMappingService } from './ga-mapping.service';
import { ToastrService } from 'ngx-toastr';
import { GaMatchType } from '../../../../services/google/ga-data/types/v1beta/ga-filter';
import { GaFilter, GaStringFilter } from '../../../../services/google/ga-data/models/ga-filter';
import { TableValueNumberFormatterSettings } from '../../../shared/table-tile/formaters/table-value-formatter-settings';

@Injectable({
    providedIn: 'root'
})
export class GATableDataService {
    private readonly gaDataService = inject(GADataService);
    private readonly gaMappingService = inject(GaMappingService);

    private readonly toastr = inject(ToastrService);

    private gaTableDefinitions = signal<GaTableDefinition[]>([
        {
            id: 0,
            title: 'Features',
            description:
                'Shows the features users interacted with and their related metrics, such as events, users, and revenue.\r\nThe more users, the more popular the selected feature.\r\nGain deeper insights by adding columns with additional information, like Country, Device Category, Transactions, etc.',
            requestType: GaRequestType.REPORT,
            columns: {
                dimensions: [
                    { name: 'customEvent:feature', removeable: true },
                    { name: 'customEvent:eventType', removeable: true }
                ],
                metrics: [
                    { name: 'eventCount', removeable: true },
                    { name: 'totalUsers', removeable: true },
                    { name: 'totalRevenue', removeable: true }
                ]
            },
            config: {
                limit: 500,
                filterControlDefinitions: [
                    {
                        filterLabel: 'Event Type',
                        type: GaColumnType.Dimension,
                        name: 'customEvent:eventType'
                    }
                ],
                filters: {
                    dimensionFilters: [
                        new GaFilter(
                            'eventName',
                            new GaStringFilter(GaMatchType.EXACT, 'feature_event')
                        )
                    ]
                },
                emptyColDefPlaceholders: {},
                sort: {
                    apiName: 'totalUsers',
                    order: 'desc',
                    type: GaColumnType.Metric
                }
            }
        },
        {
            id: 1,
            title: 'Transitions',
            description:
                'Shows user transitions between features and their related metrics, such as events, users, and revenue.\r\nIt helps to understand the user flow and how specific transitions impact conversion.\r\nGain deeper insights by adding columns with additional information, like Country, Device Category, Transactions, etc.',
            requestType: GaRequestType.REPORT,
            columns: {
                dimensions: [
                    { name: 'customEvent:prevFeature', removeable: true },
                    { name: 'customEvent:feature', removeable: true },
                    { name: 'customEvent:eventType', removeable: true }
                ],
                metrics: [
                    { name: 'eventCount', removeable: true },
                    { name: 'totalUsers', removeable: true },
                    { name: 'totalRevenue', removeable: true }
                ]
            },
            config: {
                limit: 500,
                filterControlDefinitions: [
                    {
                        filterLabel: 'Source Feature',
                        type: GaColumnType.Dimension,
                        name: 'customEvent:prevFeature'
                    },
                    {
                        filterLabel: 'Feature',
                        type: GaColumnType.Dimension,
                        name: 'customEvent:feature'
                    },
                    {
                        filterLabel: 'Event Type',
                        type: GaColumnType.Dimension,
                        name: 'customEvent:eventType'
                    }
                ],
                filters: {
                    dimensionFilters: [
                        new GaFilter(
                            'eventName',
                            new GaStringFilter(GaMatchType.EXACT, 'feature_event')
                        )
                    ]
                },
                emptyColDefPlaceholders: {
                    'customEvent:prevFeature': '$web'
                },
                sort: {
                    apiName: 'totalUsers',
                    order: 'desc',
                    type: GaColumnType.Metric
                }
            }
        },
        {
            id: 2,
            title: 'Transition Actions',
            description:
                'Shows detailed UI elements that users interacted with, as well as features, transitions, and events associated with user actions.\r\nGain deeper insights by adding columns with additional information, like Country, Device Category, Transactions, etc.',
            requestType: GaRequestType.REPORT,
            columns: {
                dimensions: [
                    { name: 'customEvent:prevFeature', removeable: true },
                    { name: 'customEvent:feature', removeable: true },
                    { name: 'customEvent:elemEvent', removeable: true },
                    { name: 'customEvent:elemTag', removeable: true },
                    { name: 'customEvent:elemName', removeable: true },
                    { name: 'customEvent:elemText', removeable: true }
                ],
                metrics: [
                    { name: 'eventCount', removeable: true },
                    { name: 'totalUsers', removeable: true },
                    { name: 'totalRevenue', removeable: true }
                ]
            },
            config: {
                limit: 500,
                filterControlDefinitions: [
                    {
                        filterLabel: 'Source Feature',
                        type: GaColumnType.Dimension,
                        name: 'customEvent:prevFeature'
                    },
                    {
                        filterLabel: 'Feature',
                        type: GaColumnType.Dimension,
                        name: 'customEvent:feature'
                    }
                ],
                filters: {
                    dimensionFilters: [
                        new GaFilter(
                            'eventName',
                            new GaStringFilter(GaMatchType.EXACT, 'feature_event')
                        ),
                        new GaFilter(
                            'customEvent:eventType',
                            new GaStringFilter(GaMatchType.EXACT, 'action')
                        )
                    ]
                },
                emptyColDefPlaceholders: {
                    'customEvent:prevFeature': '$web'
                },
                sort: {
                    apiName: 'totalUsers',
                    order: 'desc',
                    type: GaColumnType.Metric
                }
            }
        },
        {
            id: 3,
            title: 'Events',
            description:
                'Displays key event tracking data, including event names, the number of occurrences, unique users, and associated revenue.',
            requestType: GaRequestType.REPORT,
            columns: {
                dimensions: [{ name: 'eventName', removeable: true }],
                metrics: [
                    { name: 'eventCount', removeable: true },
                    { name: 'totalUsers', removeable: true },
                    { name: 'totalRevenue', removeable: true }
                ]
            },
            config: {
                limit: 500,
                filterControlDefinitions: [],
                emptyColDefPlaceholders: {
                    'customEvent:prevFeature': '$web'
                },
                sort: {
                    apiName: 'totalUsers',
                    order: 'desc',
                    type: GaColumnType.Metric
                }
            }
        }
    ]);

    public async load(
        datasource: Datasource,
        request: GaRequest<GaRequestType>
    ): Promise<GaTableData | null> {
        let response;

        switch (request.type) {
            case 'report':
                response = await this.loadReportTableData(datasource, request.payload);
                break;
            default:
                response = null;
                break;
        }

        return response;
    }

    public createTableRemoveableColumnGroups(
        metadata: GaMetadata,
        definition: GaTableDefinition
    ): GaColumnGroup[] {
        const groups: GaColumnGroup[] = [];

        this.populateRemoveableColumnGroups(
            groups,
            metadata.dimensions,
            definition.columns.dimensions,
            GaColumnType.Dimension
        );
        this.populateRemoveableColumnGroups(
            groups,
            metadata.metrics,
            definition.columns.metrics,
            GaColumnType.Metric
        );

        groups.sort((g1, g2) => g1.category.localeCompare(g2.category));

        return groups;
    }

    public createTableAddableColumnGroups(
        metadata: GaMetadata,
        definition: GaTableDefinition
    ): GaColumnGroup[] {
        const groups: GaColumnGroup[] = [];

        this.populateAddableColumnGroups(
            groups,
            metadata.dimensions,
            definition.columns.dimensions,
            GaColumnType.Dimension
        );
        this.populateAddableColumnGroups(
            groups,
            metadata.metrics,
            definition.columns.metrics,
            GaColumnType.Metric
        );

        groups.sort((g1, g2) => g1.category.localeCompare(g2.category));

        return groups;
    }

    public createColumnEmptyPlaceholdersFromDefinitions(placeholders: {
        [colDefName: string]: string;
    }): { [colName: string]: string } {
        return Object.entries(placeholders).reduce(
            (acc, [key, value]) => {
                acc[this.gaMappingService.mapGaDefinitionToUi(key)] ??= value;
                return acc;
            },
            {} as { [colName: string]: string }
        );
    }

    public getGaTableDefinitions() {
        return this.gaTableDefinitions.asReadonly();
    }

    public async validateColumnCompatibility(
        datasource: Datasource,
        baseRequest: GaRequest<GaRequestType>,
        colName: string,
        colType: GaColumnType
    ): Promise<boolean> {
        const request = new GaRequest(baseRequest.type, {
            limit: '1',
            dateRanges: baseRequest.payload.dateRanges,
            dimensions: [
                ...(baseRequest.payload.dimensions ?? []),
                ...(colType === GaColumnType.Dimension ? [new GaDataDimension(colName)] : [])
            ],
            metrics: [
                ...(baseRequest.payload.metrics ?? []),
                ...(colType === GaColumnType.Metric ? [new GaDataMetric(colName)] : [])
            ]
        });

        if (request.type === GaRequestType.REPORT) {
            const { error } = await this.gaDataService.runReport(datasource, request.payload);
            return !error;
        }

        return false;
    }

    public async getCompatibleMetaData(
        datasource: Datasource,
        definition: GaTableDefinition
    ): Promise<GaMetadata | null> {
        const dimensions = definition.columns.dimensions.map(d => ({
            name: d.name
        }));

        const metrics = definition.columns.metrics.map(m => ({
            name: m.name
        }));

        const response = await this.gaDataService.checkCompatibility(
            datasource,
            new GaCheckCompitabilityReq(dimensions, metrics)
        );

        if (response.error) {
            return null;
        }

        const compitableDimensions =
            response.data?.dimensionCompatibilities
                ?.filter(d => d.compatibility === GaCompatibility.COMPATIBLE)
                .map(d => d.dimensionMetadata) ?? [];
        const compitableMetrics =
            response.data?.metricCompatibilities
                ?.filter(d => d.compatibility === GaCompatibility.COMPATIBLE)
                .map(d => d.metricMetadata) ?? [];

        return new GaMetadata(compitableDimensions, compitableMetrics);
    }

    public addColumnToConfiguration(definitionId: number, apiName: string, type: GaColumnType) {
        this.gaTableDefinitions.update(definitions =>
            produce(definitions, draft => {
                const definition = draft.find(c => c.id === definitionId);
                if (definition) {
                    if (type === GaColumnType.Dimension) {
                        definition.columns.dimensions.push({
                            name: apiName,
                            removeable: true
                        });
                    } else if (type === GaColumnType.Metric) {
                        definition.columns.metrics.push({
                            name: apiName,
                            removeable: true
                        });
                    }
                }
            })
        );
    }

    public removeColumnFromConfiguration(
        definitionId: number,
        apiName: string,
        type: GaColumnType
    ) {
        this.gaTableDefinitions.update(definitions =>
            produce(definitions, draft => {
                const definition = draft.find(def => def.id === definitionId);
                if (definition) {
                    if (type === GaColumnType.Dimension) {
                        definition.columns.dimensions = definition.columns.dimensions.filter(
                            dim => dim.name !== apiName
                        );
                    } else if (type === GaColumnType.Metric) {
                        definition.columns.metrics = definition.columns.metrics.filter(
                            metric => metric.name !== apiName
                        );
                    }

                    if (definition.config.sort?.apiName === apiName) {
                        definition.config.sort = undefined;
                    }
                }
            })
        );
    }

    private populateRemoveableColumnGroups(
        groups: GaColumnGroup[],
        metadataList: GaMetricMetaData[] | GaDimensionMetaData[],
        columns: { name: string; removeable: boolean }[],
        columnType: GaColumnType
    ): void {
        const metaMap = new Map(metadataList.map(m => [m.apiName, m]));

        columns
            .filter(column => column.removeable)
            .forEach(column => {
                const metaItem = metaMap.get(column.name);
                if (metaItem) {
                    this.addColumnToGroup(groups, metaItem, columnType);
                }
            });
    }

    private populateAddableColumnGroups(
        groups: GaColumnGroup[],
        metadataList: GaMetricMetaData[] | GaDimensionMetaData[],
        visibleColumns: { name: string }[],
        columnType: GaColumnType
    ): void {
        const visibleColumnNames = new Set(visibleColumns.map(column => column.name));

        metadataList.forEach(metadataItem => {
            if (!visibleColumnNames.has(metadataItem.apiName)) {
                this.addColumnToGroup(groups, metadataItem, columnType);
            }
        });
    }

    private addColumnToGroup(
        groups: GaColumnGroup[],
        metadataItem: GaMetricMetaData | GaDimensionMetaData,
        columnType: GaColumnType
    ): void {
        const existingGroup = groups.find(group => group.category === metadataItem.category);

        const columnOption = {
            apiName: metadataItem.apiName,
            type: columnType,
            description: metadataItem.description,
            uiName: this.gaMappingService.mapGaDefinitionToUi(metadataItem.apiName)
        };

        if (existingGroup) {
            existingGroup.options.push(columnOption);
        } else {
            groups.push({
                category: metadataItem.category,
                options: [columnOption]
            });
        }
    }

    private async loadReportTableData(datasource: Datasource, request: GaDataRunReportReq) {
        let columnDefinitions: GaTableColumnDefinition[] = [];
        let rowsData: { [x: string]: string }[] = [];
        let columnData: { [x: string]: string[] } = {};

        const resp = await this.gaDataService.runReport(datasource, request);

        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return {
                columnDefinitions,
                rowsData,
                columnData
            };
        }

        const data = resp.data!;
        // NOTE:
        // Assuming the response headers should match the request headers, we might refactor this logic
        const dimensionHeaders = data.dimensionHeaders ?? [];
        const metricHeaders = data.metricHeaders ?? [];

        columnDefinitions = [
            ...dimensionHeaders.map(x => {
                return {
                    name: this.gaMappingService.mapGaDefinitionToUi(x.name)
                };
            }),
            ...metricHeaders.map(x => {
                return {
                    name: this.gaMappingService.mapGaDefinitionToUi(x.name),
                    formatterSettings: new TableValueNumberFormatterSettings(',', 2)
                };
            })
        ];

        rowsData =
            data.rows?.map(row => {
                const dimVals = row.dimensionValues?.map(dim => dim.value) ?? [];
                const metricVals = row.metricValues?.map(metric => metric.value) ?? [];
                return {
                    ...Object.fromEntries(
                        dimVals.map((val, i) => {
                            if (columnData[dimensionHeaders[i].name]) {
                                columnData[dimensionHeaders[i].name].push(val);
                            } else {
                                columnData[dimensionHeaders[i].name] = [val];
                            }
                            return [
                                this.gaMappingService.mapGaDefinitionToUi(dimensionHeaders[i].name),
                                val
                            ];
                        })
                    ),
                    ...Object.fromEntries(
                        metricVals.map((val, i) => [
                            this.gaMappingService.mapGaDefinitionToUi(metricHeaders[i].name),
                            val
                        ])
                    )
                };
            }) ?? [];
        return {
            columnDefinitions,
            rowsData,
            columnData
        };
    }
}
