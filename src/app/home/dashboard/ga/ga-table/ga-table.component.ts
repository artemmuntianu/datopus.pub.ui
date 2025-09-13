import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    untracked,
    input,
    Signal,
    signal,
} from '@angular/core';
import { UserMessages } from '../../../../consts';
import { Datasource } from '../../../../services/api/models';

import { GAFilterService } from '../services/ga-filter.service';
import { EnlargeButtonComponent } from '../shared/enlarge-button.component';
import {
    FilterOptionsComponent,
    GAFilterChangedEvent,
    GAFilterEventSource,
} from '../shared/filter-options/filter-options.component';
import { produce } from 'immer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
    GaRequest,
    GaRequestType,
} from '../../../../services/google/ga-data/models/ga-request';
import { GATableDataService } from '../services/ga-table-data.service';
import { GaDataDateRange } from '../../../../services/google/ga-data/models';
import {
    catchError,
    EMPTY,
    finalize,
    from,
    Subject,
    switchMap,
    tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OverlayModule } from '@angular/cdk/overlay';
import {
    GaColumnOption,
    GAColumnSelectionComponent,
} from './ga-column-selection/ga-column-selection.component';
import { GaMetadata } from '../../../../services/google/ga-data/models/ga-metadata-resp';
import {
    GaTableData,
    GaTableDatasource,
    GaTableDefinition,
    GaTableFilterControl,
    GaTableFilterState,
    GaTableSort,
} from '../types/table/table';
import { GaColumnType } from '../../../../services/google/ga-data/types/v1beta/ga-column';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { GaTableOverlayComponent } from './ga-table-overlay/ga-table-overlay.component';
import { GaTableOverlayItem } from './ga-table-overlay/ga-table-overlay-item.directive';
import {
    GA_MAX_DIMENSIONS,
    GA_MAX_METRICS,
} from '../../../../services/google/consts';
import { Sort } from '@angular/material/sort';
import { GaTableSortService } from '../services/ga-table-sort.service';
import { ToastrService } from 'ngx-toastr';
import { DateRange } from '../../../../shared/types/date-range';
import { HomeTimeService } from '../../../shared/services/home-time.service';
import { TableTileComponent } from "../../../shared/table-tile/table-tile.component";

type FilterUpdated = boolean;

@Component({
    selector: 'app-ga-table',
    templateUrl: './ga-table.component.html',
    styleUrl: './ga-table.component.scss',
    standalone: true,
    imports: [
    FilterOptionsComponent,
    EnlargeButtonComponent,
    MatProgressSpinnerModule,
    OverlayModule,
    MatButtonModule,
    MatMenuModule,
    GAColumnSelectionComponent,
    GaTableOverlayComponent,
    GaTableOverlayItem,
    TableTileComponent
],
    providers: [GAFilterService, GaTableSortService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaTableComponent {
    private readonly gaTableDataService = inject(GATableDataService);
    private readonly gaFilterService = inject(GAFilterService);
    private readonly gaTableSortService = inject(GaTableSortService);
    private readonly timeService = inject(HomeTimeService);
    private readonly toastr = inject(ToastrService);

    private loadTrigger$ = new Subject<{
        request: GaRequest<GaRequestType>;
        source: Datasource;
    }>();

    // Inputs
    datasource = input.required<Datasource | null>();
    definition = input.required<GaTableDefinition>();

    // Signals
    loading = signal<boolean>(true);
    loadingMeta = signal<boolean>(true);
    addingNewColumn = signal<boolean>(false);
    allDataLoaded = signal<boolean>(false);
    timeRange: Signal<DateRange> =
        this.timeService.getGlobalDateRangeTime();
    tableData = signal<GaTableData | null>(null);
    metadata = signal<GaMetadata | null>(null);
    offset = signal<number>(0);
    sort = signal<GaTableSort | null>(null);

    private filterState = signal<GaTableFilterState>(new Map());

    // Computed
    config = computed(() => {
        return this.definition().config;
    });

    filterControls = computed<GaTableFilterControl[] | null>(() => {
        return this.gaFilterService.buildFilterControls(
            this.config(),
            this.tableData()?.columnData
        );
    });

    defaultFilters = computed(() => {
        return this.definition().config.filters;
    });

    title = computed<string>(() => {
        return this.definition().title;
    });

    description = computed<string>(() => {
        return this.definition().description;
    });

    limit = computed<number>(() => {
        return this.config().limit;
    });

    emptyCellPlaceholders = computed(() => {
        return this.gaTableDataService.createColumnEmptyPlaceholdersFromDefinitions(
            this.config().emptyColDefPlaceholders
        );
    });

    sortSettings = computed(() => {
        const sortConfigration = this.config().sort;

        if (!sortConfigration) return null;

        return this.gaTableSortService.createTableSortSettingsfromDefinition(
            sortConfigration
        );
    });

    removeableColumnGroups = computed(() => {
        const meta = this.metadata();
        const definition = this.definition();

        if (!meta || !definition) {
            return null;
        }

        return this.gaTableDataService.createTableRemoveableColumnGroups(
            meta,
            definition
        );
    });

    addableColumnGroups = computed(() => {
        const meta = this.metadata();
        const definition = this.definition();

        if (!meta || !definition) {
            return null;
        }

        return this.gaTableDataService.createTableAddableColumnGroups(
            meta,
            definition
        );
    });

    dimensionsLimitExceeded = computed(() => {
        return this.definition().columns.dimensions.length >= GA_MAX_DIMENSIONS;
    });

    metricsLimitExceeded = computed(() => {
        return this.definition().columns.metrics.length >= GA_MAX_METRICS;
    });

    isColumnAdditionDisabled = computed(() => {
        const groups = this.addableColumnGroups();

        return (
            (this.dimensionsLimitExceeded() && this.metricsLimitExceeded()) ||
            this.loadingMeta() ||
            this.addingNewColumn() ||
            !groups ||
            groups.length === 0
        );
    });

    isColumnRemovalDisabled = computed(() => {
        const groups = this.removeableColumnGroups();

        return !groups || groups.length === 0 || this.loadingMeta();
    });

    baseRequest = computed<GaRequest<GaRequestType>>(() => {
        const def = this.definition();
        const dateRanges = this.timeRange();

        return new GaRequest(def.requestType, {
            dateRanges: [new GaDataDateRange(dateRanges.start, dateRanges.end)],
            dimensions: def.columns.dimensions.map((d) => ({
                name: d.name,
            })),
            metrics: def.columns.metrics.map((m) => ({
                name: m.name,
            })),
        });
    });

    fullRequest = computed<GaRequest<GaRequestType>>(() => {
        const request = this.baseRequest();
        const filterState = this.filterState();
        const sortState = this.sort();
        const defaultFilters = this.defaultFilters();

        const limit = this.limit().toString();
        const offset = this.offset().toString();

        const defaultFiltersClone = {
            dimensionFilters: [...(defaultFilters?.dimensionFilters ?? [])],
            metricFilters: [...(defaultFilters?.metricFilters ?? [])],
        };

        const filters = this.gaFilterService.buildFilterPayload(
            filterState,
            defaultFiltersClone
        );

        const orderBy = this.gaTableSortService.buildGaSort(sortState);

        return new GaRequest(request.type, {
            ...request.payload,
            ...filters,
            orderBys: orderBy ? [orderBy] : undefined,
            limit,
            offset,
        });
    });

    constructor() {
        // switchMap is used to skip previous requests to avoid data races and improve perfomance
        this.loadTrigger$
            .pipe(
                takeUntilDestroyed(),
                switchMap(({ request, source }) =>
                    this.loadTableData(request, source)
                )
            )
            .subscribe();

        effect(
            // trigger data load whenever time range, request or datasource changed
            () => {
                const request = this.baseRequest();
                const source = this.datasource();

                if (!source || !request) {
                    return;
                }

                this.resetOffset();

                this.loadTrigger$.next({
                    // use untrack to prevent effect triggering for other dependecies of fullRequest
                    request: untracked(this.fullRequest)!,
                    source,
                });
            },
            { allowSignalWrites: true }
        );

        effect(
            () => {
                const definition = this.definition();
                const datasource = this.datasource();

                if (!definition || !datasource) {
                    return;
                }

                this.loadMetaData(datasource, definition);
            },
            { allowSignalWrites: true }
        );

        const sortSet = effect(
            () => {
                const definition = this.definition();

                this.sort.set(definition.config.sort ?? null);

                sortSet.destroy();
            },
            { allowSignalWrites: true }
        );
    }

    async addNewColumn(option: GaColumnOption) {
        if (!this.validateAddingNewColumnLimits(option)) return;

        // NOTE: Some columns require addition setup for request like
        // Cohort dimension(cohort spec) or Comparison dimension(filter-partitions field)
        // So before adding new column we try to make request and check if it's working
        // TODO: dinamically configure required payload based on column
        this.addingNewColumn.set(true);

        const valid = await this.gaTableDataService.validateColumnCompatibility(
            this.datasource()!,
            this.baseRequest(),
            option.apiName,
            option.type
        );

        if (!valid) {
            this.addingNewColumn.set(false);
            this.toastr.error(UserMessages.gaAddingColumnCompatibilityIssue);
            return;
        }

        this.gaTableDataService.addColumnToConfiguration(
            this.definition().id,
            option.apiName,
            option.type
        );
        this.addingNewColumn.set(false);
    }

    removeColumn(option: GaColumnOption) {
        this.gaTableDataService.removeColumnFromConfiguration(
            this.definition().id,
            option.apiName,
            option.type
        );

        this.sort.update((sort) => {
            return sort?.apiName === option.apiName ? null : sort;
        });
    }

    applyNewSort(sort: Sort) {
        const tableSort = this.gaTableSortService.buildGaTableSort(
            sort,
            this.metadata()
        );

        this.resetOffset();

        this.sort.set(tableSort);

        this.loadTrigger$.next({
            request: this.fullRequest()!,
            source: this.datasource()!,
        });
    }

    applyNewFilter(
        filter: GaTableFilterControl,
        filterEvent: GAFilterChangedEvent
    ) {
        const updated = this.updateFilterState(filter, filterEvent);

        if (updated) {
            this.resetOffset();
            this.loadTrigger$.next({
                request: this.fullRequest()!,
                source: this.datasource()!,
            });
        }
    }

    loadMore() {
        this.loadTrigger$.next({
            request: this.fullRequest()!,
            source: this.datasource()!,
        });
    }

    private validateAddingNewColumnLimits(option: GaColumnOption) {
        switch (option.type) {
            case GaColumnType.Dimension:
                if (this.dimensionsLimitExceeded()) {
                    this.toastr.error(
                        UserMessages.gaAddingDimensionColumnLimitIssue
                    );
                    return false;
                }
                return true;
            case GaColumnType.Metric:
                if (this.metricsLimitExceeded()) {
                    this.toastr.error(
                        UserMessages.gaAddingMetricColumnLimitIssue
                    );
                    return false;
                }
                return true;
        }
    }

    private async loadMetaData(
        datasource: Datasource,
        definition: GaTableDefinition
    ) {
        this.loadingMeta.set(true);

        try {
            const meta = await this.gaTableDataService.getCompatibleMetaData(
                datasource,
                definition
            );
            this.metadata.set(meta);
        } catch (err: any) {
            this.toastr.error(UserMessages.technicalIssue);
        } finally {
            this.loadingMeta.set(false);
        }
    }

    private loadTableData(
        request: GaRequest<GaRequestType>,
        source: Datasource
    ) {
        this.loading.set(true);

        return from(this.gaTableDataService.load(source, request)).pipe(
            tap((data) => this.handleLoadedTableData(data)),
            catchError((err) => this.handleLoadTableDataError(err)),
            finalize(() => this.loading.set(false))
        );
    }

    private handleLoadedTableData(data: GaTableData | null) {
        if (!data) return;

        if (this.offset() === 0) {
            this.tableData.set(data);
        } else {
            this.tableData.update((v) =>
                produce(v, (draft) => {
                    if (!draft) {
                        return data;
                    }

                    draft.rowsData.push(...data.rowsData);

                    Object.entries(data.columnData).forEach(([key, values]) => {
                        if (!draft.columnData[key]) {
                            draft.columnData[key] = [];
                        }
                        draft.columnData[key].push(...values);
                    });

                    draft.columnDefinitions = data.columnDefinitions;

                    return draft;
                })
            );
        }

        this.updatePaginationState(data.rowsData);
    }

    private handleLoadTableDataError(err: any) {
        this.toastr.error(UserMessages.technicalIssue);
        console.error(err);
        return EMPTY;
    }

    private resetOffset() {
        this.offset.set(0);
    }

    private updatePaginationState(data?: GaTableDatasource) {
        const limit = this.limit();
        const isAllDataLoaded = data?.length !== limit;

        if (!isAllDataLoaded) {
            this.offset.update((offset) => offset + limit);
        }

        this.allDataLoaded.set(isAllDataLoaded);
    }

    private updateFilterState(
        filter: GaTableFilterControl,
        filterEvent: GAFilterChangedEvent
    ): FilterUpdated {
        const currentFilter = this.filterState().get(filter.name);
        const isFilterChanged = currentFilter?.value !== filterEvent.value;

        switch (filterEvent.source) {
            case GAFilterEventSource.reset:
                return this.deleteFilter(filter);
            case GAFilterEventSource.select:
                if (isFilterChanged) {
                    this.setNewFilter(filter, filterEvent.value);
                    return true;
                }
                return false;
            case GAFilterEventSource.focusout:
                // If filter value is empty, we follow such rule:
                // If it was selected, then apply it to request
                // Else it was manually reset and we should delete it from filter state

                const isManuallyReset =
                    filterEvent.value === '' && !filterEvent.isOptionSelected;

                if (isManuallyReset) {
                    return this.deleteFilter(filter);
                } else if (isFilterChanged) {
                    this.setNewFilter(filter, filterEvent.value);
                    return true;
                }
        }

        return false;
    }

    private setNewFilter(filter: GaTableFilterControl, value: string) {
        this.filterState.update((state) => {
            const newState = new Map(state);
            newState.set(filter.name, {
                ...filter,
                value: value,
            });
            return newState;
        });
    }

    private deleteFilter(filter: GaTableFilterControl): boolean {
        let deleted = true;

        this.filterState.update((state) => {
            if (!state.has(filter.name)) {
                deleted = false;
                return state;
            }
            const newState = new Map(state);
            newState.delete(filter.name);
            return newState;
        });

        return deleted;
    }
}
