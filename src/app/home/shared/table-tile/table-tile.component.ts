import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    input,
    output,
    signal,
    ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { debounceTimeAfter } from '../../../shared/rxjs-operators/debounce-after';
import { TableValueFormatterSettings } from './formaters/table-value-formatter-settings';
import { TableValueFormatter } from './formaters/table-value-formatter.pipe';

type TableRowData = { [columnName: string]: string | number };

export interface TableColumnDefinition {
    name: string;
    formatterSettings?: TableValueFormatterSettings;
}

const SKELETON_COLUMNS = [
    { name: '1' },
    { name: '2' },
    { name: '3' },
    { name: '4' },
    { name: '5' },
    { name: '6' },
    { name: '7' }
];

const SKELETON_ROW: TableRowData = {
    '1': '',
    '2': '',
    '3': '',
    '4': '',
    '5': '',
    '6': '',
    '7': ''
};
type TableDatasource = TableRowData[];
const SKELETON_ROWS: TableRowData[] = new Array(8).fill(SKELETON_ROW);

@Component({
    selector: 'app-table-tile',
    styleUrl: './table-tile.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        RouterModule,
        MatTooltipModule,
        TableValueFormatter,
        MatPaginatorModule
    ],
    providers: [DecimalPipe, DatePipe],
    templateUrl: './table-tile.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableTileComponent {
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    readonly dataSource = new MatTableDataSource<TableRowData>(SKELETON_ROWS);

    protected columns = signal<TableColumnDefinition[]>(SKELETON_COLUMNS);
    protected isInitiallyLoading = signal(true);
    private destroy$ = new Subject<void>();

    selectedRow: any;

    sortChange = output<Sort>();

    title = input('', {
        transform: (v: string | undefined | null) => {
            return v ?? '';
        }
    });

    emptyCellPlaceholders = input<{ [colName: string]: string }>({});

    titleTooltip = input<string>();
    tableClass = input<string>('table-tile-container');
    enablePagination = input<boolean>(false);
    enableSort = input<boolean>(true);

    columnsInput = input<TableColumnDefinition[] | null | undefined>(null, {
        alias: 'columns'
    });

    dataSourceInput = input<TableDatasource | null | undefined>(null, {
        alias: 'dataSource'
    });

    displayedColumns = computed(() => {
        return this.columns().map(col => {
            return col.name;
        });
    });

    isDataLoaded = computed(() => {
        return !!this.dataSourceInput() && !!this.columnsInput();
    });

    useBuildInSort = input<boolean>(false);

    sortSettings = input<{
        defaultColumn: string;
        defaultDirection: 'asc' | 'desc';
    } | null>();

    constructor() {
        const loaded = effect(
            () => {
                if (this.isDataLoaded()) {
                    this.isInitiallyLoading.set(false);
                    loaded.destroy();
                }
            },
            { allowSignalWrites: true }
        );

        effect(() => {
            const sortSettings = this.sortSettings();

            if (sortSettings) {
                this.updateSortSettings(sortSettings);
            }
        });

        effect(
            () => {
                const colInput = this.columnsInput();
                const sourceInput = this.dataSourceInput();

                if (!this.isInitiallyLoading()) {
                    this.dataSource.data = sourceInput ?? [];
                    this.columns.set(colInput ?? []);
                }
            },
            { allowSignalWrites: true }
        );
    }

    ngAfterViewInit() {
        if (this.enablePagination()) {
            this.dataSource.paginator = this.paginator;
        }
    }

    ngOnInit() {
        this.sort.sortChange
            .pipe(
                debounceTimeAfter(1, 1000),
                takeUntil(this.destroy$),
                distinctUntilChanged(
                    (prev, curr) => prev.active === curr.active && prev.direction === curr.direction
                )
            )
            .subscribe(v => {
                if (this.useBuildInSort()) {
                    this.updateSortSettings({
                        defaultColumn: v.active,
                        defaultDirection: v.direction === 'asc' ? 'asc' : 'desc',
                    }, true);
                } else {
                    this.sortChange.emit(v);
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    rowClicked(row: any) {
        if (this.selectedRow === row) {
            this.selectedRow = null;
        } else {
            this.selectedRow = row;
        }
    }

    private updateSortSettings(
        sortSettings: {
            defaultColumn: string;
            defaultDirection: 'asc' | 'desc';
        },
        force: boolean = false
    ) {
        const previousSortActive = this.sort.active;
        const previousSortDirection = this.sort.direction;
    
        if (force) {
            this.sort.active = sortSettings.defaultColumn;
            this.sort.direction = sortSettings.defaultDirection;
        } else {
            this.sort.active ||= sortSettings.defaultColumn;
            this.sort.direction ||= sortSettings.defaultDirection;
        }
    
        if (force || this.sort.active !== previousSortActive || this.sort.direction !== previousSortDirection) {
            this.dataSource.sort = this.sort;
            if (this.paginator) {
                this.dataSource.paginator = this.paginator;
            }
        }
    }
}
