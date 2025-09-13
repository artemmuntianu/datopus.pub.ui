import { Component, inject } from '@angular/core';
import { GettingStartedPageComponent } from '../getting-started-page.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-setup-analytics',
    standalone: true,
    imports: [
        GettingStartedPageComponent,
        MatButtonModule,
        RouterLink,
        CdkAccordionModule,
        MatExpansionModule,
        CommonModule
    ],
    templateUrl: './setup-analytics.component.html'
})
export class SetupAnalyticsComponent {
    private breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Getting Started', 'Setup Analytics']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
} 