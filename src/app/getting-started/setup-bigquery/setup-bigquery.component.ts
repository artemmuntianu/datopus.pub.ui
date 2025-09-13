import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GettingStartedPageComponent } from '../getting-started-page.component';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-setup-bigquery',
    standalone: true,
    imports: [GettingStartedPageComponent, MatButtonModule, RouterLink],
    templateUrl: './setup-bigquery.component.html'
})
export class SetupBigQueryComponent {
    private breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Getting Started', 'Setup BigQuery']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
} 