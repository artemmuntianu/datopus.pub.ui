import { CommonModule } from '@angular/common';
import {
    Component,
    ViewChild,
    inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import {
    NgDatePickerModule,
} from 'ng-material-date-range-picker';
import { ToastrService } from 'ngx-toastr';
import * as Utils from '../../../utilities';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';
import { UserMessages } from '../../consts';
import { Org, User } from '../../services/api/models';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { HomeTimeService } from '../shared/services/home-time.service';
import { DashboardUsersTileComponent } from './dashboard-users-tile/dashboard-users-tile.component';
import { FeaturesTileComponent } from './features-tile/features-tile.component';
import { GaDashboardComponent } from './ga/ga-dashboard/ga-dashboard.component';
import { InsightsTileComponent } from './insights-tile/insights-tile.component';

@Component({
    selector: 'app-home-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        RouterModule,
        FeaturesTileComponent,
        InsightsTileComponent,
        DashboardUsersTileComponent,
        GaDashboardComponent,
        NgDatePickerModule,
    ],
    providers: [
        FeaturesTileComponent,
        InsightsTileComponent,
        DashboardUsersTileComponent,
    ],
    templateUrl: './home-dashboard.component.html',
    styleUrl: './home-dashboard.component.scss',
})
export class HomeDashboardComponent {
    @ViewChild(FeaturesTileComponent) featuresTile: FeaturesTileComponent;
    protected breadcrumbService = inject(BreadcrumbService);

    protected timeService = inject(HomeTimeService);

    user: User = User.current!;
    data = {
        org: <Org | null>null,
    };

    private readonly sbService = inject(SupabaseService);
    private readonly toastr = inject(ToastrService);

    async ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Dashboard'])

        const resp: any = await this.sbService.getOrg(this.user.orgId);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }
        this.data.org = new Org(resp.data[0]);

        if (this.data.org!.isDemo) {
            Utils.forkByOrgType(
                this.user.orgType,
                async () => {
                    const resp = await this.sbService.getPartnerOrgs(
                        this.user.orgId
                    );
                    if (resp.error) {
                        this.toastr.error(UserMessages.technicalIssue);
                        return;
                    }
                    const partnerOrgs = resp.data;
                    const datasourceIds = partnerOrgs.map(
                        (x: any) => x.datasource_id
                    );
                    this.featuresTile.setData(datasourceIds);
                },
                async () => {
                    const datasourceIds = [this.data.org!.datasource_id!];
                    setTimeout(() => this.featuresTile.setData(datasourceIds));
                }
            );
        }
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
}
