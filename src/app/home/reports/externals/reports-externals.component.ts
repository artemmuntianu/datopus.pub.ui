import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import * as Utils from '../../../../utilities';
import { ExternalReport } from '../../../services/api/models/externalReport';
import { Org } from '../../../services/api/models/org';
import { PartnerOrg } from '../../../services/api/models/partnerOrg';
import { User } from '../../../services/api/models/user';
import { ReportsExternalsService } from '../../../services/api/reports-externals.service';
import { UserMessages } from '../../../consts';
import { SupabaseService } from '../../../services/supabase/supabase.service';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from '../../../common/breadcrumbs/breadcrumb.service';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-reports-externals',
    standalone: true,
    imports: [
        RouterLink, CommonModule, MatCardModule, MatButtonModule, FormsModule,
        MatOptionModule, MatLabel, MatSelectModule, MatFormFieldModule, MatTooltipModule,
        MatInputModule, MatIcon
    ],
    templateUrl: './reports-externals.component.html',
    styleUrl: './reports-externals.component.scss'
})
export class ReportsExternalsComponent {

    selectedReport: ExternalReport | undefined;
    selectedPartnerOrg: PartnerOrg | undefined;

    user = User.current!;
    isSidebarVisible = true;
    isAddNewReportPopupActive = false;
    reports = {
        unpublished: <ExternalReport[]>[],
        published: <ExternalReport[]>[]
    };
    data = {
        org: <Org>{},
        partnerOrgs: <PartnerOrg[]>[],
        reports: <ExternalReport[]>[]
    };
    addNewReportPopupFields: any = {};

    constructor(private reportsExternalsService: ReportsExternalsService, private sbService: SupabaseService, private toastr: ToastrService, private breadcrumbService: BreadcrumbService) { }

    async ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb( ['External Reports'])
        await this.initData();
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }

    onPartnerOrgChanged() {
        this.setData(null, this.selectedPartnerOrg!.id);
    }

    async onAddNewReportClick() {
        const url: string = this.addNewReportPopupFields['url'];
        let icon: string | null = null;
        if (url.indexOf('docs.google.com/spreadsheets') > -1)
            icon = 'google-spreadsheet';
        else if (url.indexOf('analytics.google.com') > -1)
            icon = 'google-analytics';

        const { data, error } = await this.reportsExternalsService.add(
            this.user.orgId,
            this.selectedPartnerOrg?.id,
            this.addNewReportPopupFields['title'],
            url,
            icon
        );
        if (error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        const added = data[0];
        this.reports.unpublished.push(added as any);
        this.selectedReport = added as any;

        this.isAddNewReportPopupActive = false;
        this.addNewReportPopupFields = {};
    }

    async initData() {
        await Utils.forkByOrgType(this.user.orgType,
            async () => {
                const resp = await this.sbService.getPartnerOrgs(this.user.orgId);
                if (resp.error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.partnerOrgs = resp.data;
                this.selectedPartnerOrg = this.data.partnerOrgs[0];
                this.setData(null, this.selectedPartnerOrg.id);
            },
            async () => {
                const resp = await this.sbService.getOrg(this.user.orgId);
                if (resp.error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.org = <any>resp.data[0];
                this.setData(this.user.orgId, null);
            }
        );
    }

    async setData(orgId: number | null, partnerOrgId: number | null) {
        this.selectedReport = undefined;
        this.reports = {
            unpublished: [],
            published: []
        };

        await Utils.forkByOrgType(this.user.orgType,
            async () => {
                const { data, error } = await this.reportsExternalsService.getByPartnerOrgId(partnerOrgId!);
                if (error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.reports = data as any;
            },
            async () => {
                const { data, error } = await this.reportsExternalsService.getByOrgId(orgId!);
                if (error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.reports = data as any;
            }
        );

        for (let report of this.data.reports) {
            if (report.is_published)
                this.reports.published.push(report);
            else
                this.reports.unpublished.push(report);
        }
    }

    async togglePublish() {
        if (!this.selectedReport)
            return;
        if (this.selectedReport.is_published) {
            const { data, error } = await this.reportsExternalsService.setIsPublished(this.selectedReport.id, false);
            if (error) {
                this.toastr.error(UserMessages.technicalIssue);
                return;
            }

            this.reports.published.splice(this.reports.published.indexOf(this.selectedReport), 1);
            this.reports.unpublished.push(this.selectedReport);
            this.selectedReport.is_published = false;
        } else {
            const { data, error } = await this.reportsExternalsService.setIsPublished(this.selectedReport.id, true);
            if (error) {
                this.toastr.error(UserMessages.technicalIssue);
                return;
            }

            this.reports.unpublished.splice(this.reports.unpublished.indexOf(this.selectedReport), 1);
            this.reports.published.push(this.selectedReport);
            this.selectedReport.is_published = true;
        }
    }

    toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
    }

    reloadIframe(iframe: HTMLIFrameElement) {
        iframe.src = this.selectedReport!.url;
    }

    openReportInNewTab() {
        window.open(this.selectedReport!.url, '_blank');
    }

    showAddNewPopup() {
        this.isAddNewReportPopupActive = true;
    }

}