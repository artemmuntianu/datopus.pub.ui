import { Routes } from '@angular/router';
import { AdminMonitorsComponent } from './admin/monitors/admin-monitors.component';
import { AdminOrganizationsComponent } from './admin/organizations/admin-organizations.component';
import { AdminUsersComponent } from './admin/users/admin-users.component';
import { AuthComponent } from './auth/auth.component';
import { ConfirmActivationComponent } from './auth/confirm-activation/confirm-activation.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { GoogleAuthCallback } from './auth/google-auth-callback/google-auth-callback.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { BlankPageComponent } from './blank-page/blank-page.component';
import { InternalErrorComponent } from './common/internal-error/internal-error.component';
import { IsRestrictedComponent } from './common/is-restricted/is-restricted.component';
import { NotFoundComponent } from './common/not-found/not-found.component';
import DashboardComponent from './home/dashboard-new/dashboard/dashboard.component';
import { HomeDashboardComponent } from './home/dashboard/home-dashboard.component';
import { HomeComponent } from './home/home.component';
import { ReportsExternalsComponent } from './home/reports/externals/reports-externals.component';
import { ReportsFlowDemoComponent } from './home/reports/features/flow/demo/reports-flow-demo.component';
import { ReportComponent } from './home/reports/features/report/report.component';
import { ReportsUsageDemoComponent } from './home/reports/features/usage/demo/reports-usage-demo.component';
import { ReportsFeaturesInsightsComponent } from './home/reports/insights/reports-features-insights.component';
import { DemoUseCasesComponent } from './pages/demo-use-cases/demo-use-cases.component';
import { PProjectsComponent } from './pages/profile-page/p-projects/p-projects.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { TeamsComponent } from './pages/profile-page/teams/teams.component';
import { UserProfileComponent } from './pages/profile-page/user-profile/user-profile.component';
import { AccountSettingsComponent } from './settings/account/account-settings/account-settings.component';
import { ChangeEmailComponent } from './settings/account/change-email/change-email.component';
import { ConfirmEmailChangeComponent } from './settings/account/change-email/confirm-email-change/confirm-email-change.component';
import { ChangePasswordComponent } from './settings/account/change-password/change-password.component';
import { SettingsAccountComponent } from './settings/account/settings.component';
import { ConnectionsComponent } from './settings/app/connections/connections.component';
import { ConnectionListComponent } from './settings/app/connections/list/connection-list.component';
import { GANewConnectionComponent } from './settings/app/connections/new/google-analytics/ga-new-connection.component';
import { BQNewConnectionComponent } from './settings/app/connections/new/google-big-query/bq-new-connection.component';
import { SettingsAppComponent } from './settings/app/settings.component';
import { ActivePlanComponent } from './settings/subscription/active-plan/active-plan.component';
import { AvailablePlansComponent } from './settings/subscription/available-plans/available-plans.component';
import { SubscriptionCheckoutSuccess } from './settings/subscription/checkouts/success/checkout-success.component';
import { PlanBuilderComponent } from './settings/subscription/plan-builder/plan-builder.component';
import { SubscriptionPortalCheckoutReturnPage } from './settings/subscription/checkouts/portal-return/portal-return.component';
import { SessionsReplayerComponent } from './sessions/sessions-replayer.component';
import { AskDataComponent } from './ask-data/ask-data.component';
import { SubscriptionSettingsComponent } from './settings/subscription/settings.component';
import { LockContentGuard } from './shared/guards/lock-content.guard';
import { SupportRequestComponent } from './support/support-request/support-request.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'getting-started',
        loadChildren: () => import('./getting-started/getting-started.module').then(m => m.GettingStartedModule)
    },
    {
        path: 'dashboard/ga',
        component: HomeDashboardComponent,
        canActivate: [LockContentGuard]
    },
    {
        path: 'dashboard/:dashboardId',
        component: DashboardComponent,
        canActivate: [LockContentGuard]
    },
    {
        path: 'dashboard/:dashboardId/report/:reportId',
        component: ReportComponent,
        canActivate: [LockContentGuard]
    },
    { path: 'session-replay', component: SessionsReplayerComponent, canActivate: [LockContentGuard] },
    { path: 'ask-data', component: AskDataComponent, canActivate: [LockContentGuard] },
    { path: 'demo-use-cases', component: DemoUseCasesComponent },
    {
        path: 'reports',
        children: [
            {
                path: 'features/flow-demo',
                component: ReportsFlowDemoComponent,
                canActivate: [LockContentGuard]
            },
            {
                path: 'features/usage-demo',
                component: ReportsUsageDemoComponent,
                canActivate: [LockContentGuard]
            },
            {
                path: 'features/:systemName',
                component: ReportComponent,
                canActivate: [LockContentGuard]
            },
            {
                path: 'insights',
                component: ReportsFeaturesInsightsComponent,
                canActivate: [LockContentGuard]
            },
            { path: 'externals', component: ReportsExternalsComponent }
        ]
    },
    {
        path: 'admin',
        children: [
            {
                path: 'organizations',
                component: AdminOrganizationsComponent,
                canActivate: [LockContentGuard]
            },
            { path: 'users', component: AdminUsersComponent, canActivate: [LockContentGuard] },
            { path: 'monitors', component: AdminMonitorsComponent, canActivate: [LockContentGuard] }
        ]
    },
    {
        path: 'settings',
        children: [
            {
                path: 'account',
                component: SettingsAccountComponent,
                children: [
                    { path: '', component: AccountSettingsComponent },
                    { path: 'change-email', component: ChangeEmailComponent },
                    { path: 'change-password', component: ChangePasswordComponent }
                ]
            },
            {
                path: 'subscription',
                component: SubscriptionSettingsComponent,
                children: [
                    { path: '', component: ActivePlanComponent },
                    { path: 'plan-builder/:productId', component: PlanBuilderComponent },
                    { path: 'available-plans', component: AvailablePlansComponent },
                    { path: 'checkout/success', component: SubscriptionCheckoutSuccess },
                    {
                        path: 'checkout/portal-return',
                        component: SubscriptionPortalCheckoutReturnPage
                    }
                ]
            },
            {
                path: 'app',
                component: SettingsAppComponent,
                children: [
                    { path: '', redirectTo: 'connections', pathMatch: 'full' },
                    {
                        path: 'connections',
                        component: ConnectionsComponent,
                        children: [
                            {
                                path: '',
                                component: ConnectionListComponent
                            },
                            {
                                path: 'new',
                                component: GANewConnectionComponent
                            },
                            {
                                path: 'new-bq',
                                component: BQNewConnectionComponent,
                                canActivate: [LockContentGuard]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: 'support-request',
        component: SupportRequestComponent
    },
    {
        path: 'profile',
        component: ProfilePageComponent,
        children: [
            { path: '', component: UserProfileComponent },
            { path: 'teams', component: TeamsComponent },
            { path: 'projects', component: PProjectsComponent }
        ]
    },
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            { path: '', component: SignInComponent },
            { path: 'sign-up', component: SignUpComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent },
            { path: 'confirm-activation', component: ConfirmActivationComponent },
            { path: 'confirm-email-change', component: ConfirmEmailChangeComponent }
        ]
    },
    { path: 'google-oauth/callback', component: GoogleAuthCallback },
    { path: 'blank-page', component: BlankPageComponent },
    { path: 'internal-error', component: InternalErrorComponent },
    { path: 'is-restricted', component: IsRestrictedComponent },
    { path: '**', component: NotFoundComponent }
];
