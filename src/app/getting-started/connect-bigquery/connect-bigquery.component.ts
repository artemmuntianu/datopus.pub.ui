import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';
import { BQNewConnectionComponent } from '../../settings/app/connections/new/google-big-query/bq-new-connection.component';
import { GettingStartedPageComponent } from '../getting-started-page.component';

@Component({
    selector: 'app-connect-bigquery',
    standalone: true,
    imports: [GettingStartedPageComponent, BQNewConnectionComponent],
    templateUrl: './connect-bigquery.component.html'
})
export class ConnectBigQueryComponent {
    private breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Getting Started', 'Connect BigQuery']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
} 