import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Dim } from '../../../services/api/models/dim';
import { ReportFeaturesInsight } from '../../../services/api/models/reportFeaturesInsight';
import { User } from '../../../services/api/models/user';
import { ReportsFeaturesInsightsService } from '../../../services/api/reports-features-insights.service';
import { BasicDrawerComponent } from '../../../ui-elements/sidenav/basic-drawer/basic-drawer.component';
import { ReportsFeaturesInsightsCardComponent } from './reports-features-insights-card/reports-features-insights-card.component';
import { UserMessages } from '../../../consts';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from '../../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-reports-features-insights',
    standalone: true,
    imports: [
        RouterLink, ReportsFeaturesInsightsCardComponent, CommonModule, MatCardModule, MatTooltipModule,
        MatButtonModule, MatIconModule, BasicDrawerComponent, MatSidenavModule, NgScrollbarModule,
        MatDividerModule
    ],
    templateUrl: './reports-features-insights.component.html',
    styleUrl: './reports-features-insights.component.scss'
})
export class ReportsFeaturesInsightsComponent {

    @ViewChild(MatDrawer) drawer: MatDrawer;

    insights: ReportFeaturesInsight[];
    selectedInsight: ReportFeaturesInsight | undefined;
    dims: Dim[];

    user = User.current!;
    isAlertVisible = {
        reportExplanation: true
    };

    constructor(private reportsFeaturesInsightsService: ReportsFeaturesInsightsService, private toastr: ToastrService, private breadcrumbService: BreadcrumbService) { }

    async ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Feature Reports', 'Insights']);

        const resp1 = await this.reportsFeaturesInsightsService.getAll(this.user.orgId);
        if (resp1.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.insights = resp1.data.map(x => {
            const monitor = <any>x.monitor;
            return new ReportFeaturesInsight({
                date: x.date,
                subtitle: x.text,
                value: x.val,
                isPercent: x.is_percent,
                serieDates: x.stats_dates,
                serieValues: x.stats,
                monitor: {
                    name: monitor.name,
                    metric: monitor.metric,
                    thresholdVal: monitor.threshold_val,
                    thresholdIsPercent: monitor.threshold_is_percent,
                    comparison: 'Day-to-day',
                    filter: monitor.filter
                }
            });
        });

        const resp2 = await this.reportsFeaturesInsightsService.getDims(this.user.orgId);
        if (resp2.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.dims = resp2.data;
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }

    onViewMonitorSettingsClick(insight: ReportFeaturesInsight) {
        this.selectedInsight = insight;
        this.drawer.toggle();
    }

    onCloseMonitorSettingsClick() {
        this.drawer.toggle();
        this.selectedInsight = undefined;
    }

    abs(val: number) {
        return Math.abs(val);
    }

    getMonitorFilterName(filter: { key: string, value: string | null }) {
        if (filter.key === 'partner_org_id')
            return 'Organization';

        return this.dims.find(x => x.col_name === filter.key)!.ui_name;
    }

}