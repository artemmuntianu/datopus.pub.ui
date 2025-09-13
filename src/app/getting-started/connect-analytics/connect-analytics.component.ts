import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';
import { GANewConnectionComponent } from '../../settings/app/connections/new/google-analytics/ga-new-connection.component';
import { GettingStartedPageComponent } from '../getting-started-page.component';

@Component({
    selector: 'app-connect-analytics',
    standalone: true,
    imports: [GettingStartedPageComponent, GANewConnectionComponent],
    templateUrl: './connect-analytics.component.html'
})
export class ConnectAnalyticsComponent {
    private breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Getting Started', 'Connect Analytics']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
} 