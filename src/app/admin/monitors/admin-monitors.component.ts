import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-admin-monitors',
    standalone: true,
    imports: [RouterLink, CommonModule, MatCardModule, MatTooltipModule],
    templateUrl: './admin-monitors.component.html',
    styleUrl: './admin-monitors.component.scss'
})
export class AdminMonitorsComponent {
    readonly breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb( ['Monitors']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
}