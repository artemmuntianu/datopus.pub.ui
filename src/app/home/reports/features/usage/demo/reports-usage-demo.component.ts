import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DateRange } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import {
    DEFAULT_DATE_OPTION_ENUM,
    ISelectDateOption,
    NgDatePickerComponent,
    NgDatePickerModule,
    SelectedDateEvent
} from 'ng-material-date-range-picker';
import { NgScrollbarModule } from 'ngx-scrollbar';
import * as Utils from '../../../../../../utilities';
import { DimValues } from '../../../../../services/api/models/dimValues';
import { Org } from '../../../../../services/api/models/org';
import { PartnerOrg } from '../../../../../services/api/models/partnerOrg';
import { User } from '../../../../../services/api/models/user';
import { ReportsFeaturesUsageService } from '../../../../../services/api/reports-features-usage.service';
import { UserMessages } from '../../../../../consts';
import { SupabaseService } from '../../../../../services/supabase/supabase.service';
import { ToastrService } from 'ngx-toastr';
import { ReportsFeaturesUsageLineChartComponent } from './line-chart/line-chart.component';
import { BreadcrumbService } from '../../../../../common/breadcrumbs/breadcrumb.service';

export interface IFeatureStatsTableElement {
    date: Date;
    datasource_id: number;
    partner_org?: string;
    feature?: string;
    dim1?: string;
    dim2?: string;
    dim3?: string;
    dim4?: string;
    dim5?: string;
    dim6?: string;
    dim7?: string;
    dim8?: string;
    dim9?: string;
    dim10?: string;
    actions?: number;
    sessions?: number;
    users?: number;
}

@Component({
    selector: 'app-reports-features-demo',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatSelectModule,
        MatMenuModule,
        MatTableModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatIcon,
        FormsModule,
        MatListModule,
        MatDividerModule,
        NgDatePickerModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatSortModule,
        NgScrollbarModule,
        ReportsFeaturesUsageLineChartComponent
    ],
    templateUrl: './reports-usage-demo.component.html',
    styleUrl: './reports-usage-demo.component.scss'
})
export class ReportsUsageDemoComponent {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatDrawer) drawer: MatDrawer;
    @ViewChild(ReportsFeaturesUsageLineChartComponent)
    chart: ReportsFeaturesUsageLineChartComponent;
    @ViewChild(NgDatePickerComponent) dateRangePicker: NgDatePickerComponent;

    user = User.current!;
    data = {
        stats: <IFeatureStatsTableElement[]>[],
        org: <Org>{},
        partnerOrgs: <PartnerOrg[]>[],
        feature: <DimValues>{},
        dims: <{ [key: string]: DimValues }>{}
    };
    displayedColumns: string[] = [];
    dataSource = new MatTableDataSource<IFeatureStatsTableElement>([]);
    selectedPartnerOrgs: string[] = [];
    selectedFeatures: string[] = [];
    selectedDims: { [key: string]: string[] } = {};
    selectedChartDimension: string | undefined = 'feature';
    selectedChartMetric = 'actions';
    selectedDateRange: DateRange<Date> = new DateRange(
        new Date('2024-08-01'),
        new Date('2024-08-08')
    );
    isAlertVisible = {
        reportExplanation: true,
        filtersRequired: false
    };

    constructor(
        private reportsFeaturesUsageService: ReportsFeaturesUsageService,
        private sbService: SupabaseService,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService
    ) {}

    async ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Feature Reports', 'Usage']);

        await Utils.forkByOrgType(
            this.user.orgType,
            async () => {
                const resp = await this.sbService.getPartnerOrgs(this.user.orgId);
                if (resp.error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.partnerOrgs = resp.data;
            },
            async () => {
                const resp = await this.sbService.getOrg(this.user.orgId);
                if (resp.error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.org = <any>resp.data[0];
            }
        );

        const resp2 = await this.reportsFeaturesUsageService.getFeatureAndValues(this.user.orgId);
        if (resp2.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }
        this.data.feature = resp2.data.map(x => {
            return {
                ui_name: x.ui_name,
                col_name: x.col_name,
                values: x.dimension_value.map(y => y.value)
            };
        })[0];

        const resp3 = await this.reportsFeaturesUsageService.getDimsAndValues(this.user.orgId);
        if (resp3.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }
        this.data.dims = resp3.data.reduce((acc: any, cur) => {
            acc[cur.col_name] = {
                ui_name: cur.ui_name,
                col_name: cur.col_name,
                values: cur.dimension_value.flatMap(x => x.value)
            };
            return acc;
        }, {});

        const toDate = this.selectedDateRange.end!;
        const _30DaysAgo = new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        const apiColumnNamesForQuery = this.getColumnNames('apiQuery');
        this.data.stats = <any>(
            await this.reportsFeaturesUsageService.getStats(
                _30DaysAgo,
                toDate,
                this.getDatasourceIds(),
                apiColumnNamesForQuery,
                this.selectedChartMetric
            )
        );
        if (apiColumnNamesForQuery.indexOf('datasource_id') > -1)
            for (let statsElem of this.data.stats)
                statsElem.partner_org = this.data.partnerOrgs.find(
                    x => x.datasource_id == statsElem.datasource_id
                )!.name;

        this.initData();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }

    onBtnClick_ShowHideSettingsPane() {
        this.drawer.toggle();
        window.dispatchEvent(new Event('resize')); /* hack to make apexchart resize itself */
    }

    onDateRangeChanged(event: SelectedDateEvent) {
        this.selectedDateRange = event.range!;
        this.onFilterChanged();
    }

    dateListOptions(optionList: ISelectDateOption[]) {
        optionList.forEach(option => {
            if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM) {
                option.isSelected = true;
            } else {
                option.isSelected = false;
            }
        });
    }

    async onFilterChanged() {
        const apiColumnNamesForQuery = this.getColumnNames('apiQuery');
        this.data.stats = <any>(
            await this.reportsFeaturesUsageService.getStats(
                this.selectedDateRange.start!,
                this.selectedDateRange.end!,
                this.getDatasourceIds(this.selectedPartnerOrgs),
                apiColumnNamesForQuery,
                this.selectedChartMetric,
                this.selectedFeatures,
                this.selectedDims
            )
        );
        if (apiColumnNamesForQuery.indexOf('datasource_id') > -1)
            for (let statsElem of this.data.stats)
                statsElem.partner_org = this.data.partnerOrgs.find(
                    x => x.datasource_id == statsElem.datasource_id
                )!.name;

        this.setData();
    }

    async onChartMetricChanged() {
        this.isAlertVisible.filtersRequired = ['users', 'sessions'].includes(
            this.selectedChartMetric
        );
        await this.onFilterChanged();
    }

    initData() {
        this.displayedColumns = [...this.getColumnNames('uiTable'), this.selectedChartMetric];
        this.dataSource.data = this.data.stats;
        this.chart.initData(
            this.data.stats as any,
            this.selectedChartDimension,
            this.selectedChartMetric
        );
    }

    setData() {
        this.displayedColumns = [...this.getColumnNames('uiTable'), this.selectedChartMetric];
        this.dataSource.data = this.data.stats;
        this.chart.setData(
            this.data.stats as any,
            this.selectedChartDimension,
            this.selectedChartMetric
        );
    }

    getDatasourceIds(partnerOrgs?: string[]) {
        return Utils.forkByOrgType(
            this.user.orgType,
            () => {
                if (partnerOrgs && partnerOrgs.length > 0)
                    return this.data.partnerOrgs
                        .filter(x => partnerOrgs.indexOf(x.name) > -1)
                        .map(x => x.datasource_id);

                return <number[]>this.data.partnerOrgs.map(x => x.datasource_id);
            },
            () => {
                return [this.data.org.datasource_id];
            }
        );
    }

    getColumnNames(dest: 'apiQuery' | 'uiTable') {
        const res = ['date'];

        if (this.selectedPartnerOrgs.length)
            dest === 'apiQuery' ? res.push('datasource_id') : res.push('partner_org');

        if (this.selectedFeatures.length) res.push('feature');

        if (this.selectedDims)
            for (let propName in this.selectedDims)
                if (this.selectedDims[propName].length) res.push(propName);

        let selectedChartDimension = this.selectedChartDimension;
        if (selectedChartDimension && selectedChartDimension.length) {
            if (selectedChartDimension === 'partner_org')
                dest === 'apiQuery'
                    ? (selectedChartDimension = 'datasource_id')
                    : (selectedChartDimension = 'partner_org');

            if (res.indexOf(selectedChartDimension) == -1) res.push(selectedChartDimension);
        }

        return res;
    }
}
