import { Component, inject } from '@angular/core';
import { GettingStartedPageComponent } from '../getting-started-page.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-link-bigquery',
    standalone: true,
    imports: [GettingStartedPageComponent, MatButtonModule, RouterLink],
    templateUrl: './link-bigquery.component.html'
})
export class LinkBigQueryComponent {
    private breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Getting Started', 'Link BigQuery']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
} 