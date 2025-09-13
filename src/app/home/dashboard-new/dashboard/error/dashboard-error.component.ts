import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
    DashboardApiError,
    DashboardApiErrorCode
} from '../../../../services/api/models/dashboard/error';
import { RedirectPlaceholderComponent } from '../../../../common/redirect-placeholder/redirect-placeholder.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard-error',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RedirectPlaceholderComponent],
    template: `
        @let dashboardError = error();

        @switch (dashboardError.code) {
            @case (DashboardErrorCode.DB_ERROR) {
                <app-redirect-placeholder
                    description="Database is not available right now. Please reload page or contact the administrator."
                    [link]="currentPath"
                    [reload]="true"
                    [title]="dashboardError.message"
                    linkText="Reload"
                ></app-redirect-placeholder>
            }

            @case (DashboardErrorCode.NOT_FOUND) {
                <app-redirect-placeholder
                    description="Dashboard or tiles are not found or doesn't exist. Please reload page or contact the administrator."
                    [link]="currentPath"
                    [reload]="true"
                    [title]="dashboardError.message"
                    linkText="Reload"
                ></app-redirect-placeholder>
            }

            @default {
                <app-redirect-placeholder
                    description="An unknown error occurred. Please refresh the app or contact the administrator."
                    [link]="currentPath"
                    [reload]="true"
                    [title]="dashboardError.message"
                    linkText="Reload"
                ></app-redirect-placeholder>
            }
        }
    `
})
export default class DashboardErrorComponent {
    error = input.required<DashboardApiError>();
    DashboardErrorCode = DashboardApiErrorCode;
    router = inject(Router);
    currentPath = '/';

    constructor() {
        this.currentPath = this.router.url;
    }
}
