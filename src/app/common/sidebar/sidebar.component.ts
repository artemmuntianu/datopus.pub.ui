import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { UserMessages } from '../../consts';
import { SubscriptionType, UserRole } from '../../enums';
import { Org } from '../../services/api/models/org';
import { User } from '../../services/api/models/user';
import { LockContentService } from '../../services/lock-content.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { SidebarMenuLinkComponent } from './sidebar-menu-link.component';
import { SidebarSubMenuLinkComponent } from './sidebar-submenu-link.component';
import { SidebarUpgradePlanComponent } from './sidebar-upgrade-plan.component';
import { ToastrService } from 'ngx-toastr';
import { DashboardStore } from '../../store/dashboard/dashboard.store';
import { DashboardDialogComponent } from '../../home/dashboard-new/dashboard/dialogs/dashboard-dialog/dashboard-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionGuardPipe } from '../../shared/pipes/sub-guard.pipe';
import { ProductKey } from '../../settings/subscription/api/models/product-key';
import { PriceLookupKey } from '../../settings/subscription/api/models/price-lookup-keys';
import { GettingStartedService, GettingStartedStep } from '../../getting-started/getting-started.service';
import { OnboardingStateService } from '../../services/onboarding/onboarding-state.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        NgScrollbarModule,
        MatExpansionModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        SidebarMenuLinkComponent,
        SidebarSubMenuLinkComponent,
        SidebarUpgradePlanComponent,
        SubscriptionGuardPipe
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
    UserRole = UserRole;
    SubscriptionType = SubscriptionType;
    PriceLookupKey = PriceLookupKey;
    user = User.current!;
    data = {
        org: <Org | null>null
    };
    lockContentService = inject(LockContentService);
    private readonly toastr = inject(ToastrService);
    readonly dashboardStore = inject(DashboardStore);
    readonly dialog = inject(MatDialog);
    readonly router = inject(Router);

    private sbService = inject(SupabaseService);
    private gettingStartedService = inject(GettingStartedService);
    private onboardingStateService = inject(OnboardingStateService);
    gettingStartedProgress$ = this.gettingStartedService.progress$;
    gettingStartedSteps = this.gettingStartedService.getSteps();

    showGettingStarted = false;
    completedSteps: string[] = [];
    progress = 0;

    async ngOnInit() {
        const resp = await this.sbService.getOrg(this.user.orgId, ['datasource']);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.org = new Org(resp.data[0]);

        this.onboardingStateService.showGettingStarted$.subscribe(
            show => this.showGettingStarted = show
        );
        this.onboardingStateService.completedSteps$.subscribe(
            steps => this.completedSteps = steps
        );
        this.onboardingStateService.progress$.subscribe(
            progress => this.progress = progress
        );
    }

    isStepCompleted(stepId: string): boolean {
        return this.completedSteps.includes(stepId);
    }

    // TODO: move into dashboard component
    addDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: { type: 'create', title: 'New Dashboard' },
            backdropClass: 'dashboard-dialog-backdrop',
            exitAnimationDuration: '200ms',
            enterAnimationDuration: '200ms'
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                const { name, description } = result;

                const dashboard = await this.dashboardStore.addDashboard({ name, description });

                if (dashboard) {
                    this.router.navigateByUrl(`/dashboard/${dashboard.id}`);
                }
            }
        });
    }
}
