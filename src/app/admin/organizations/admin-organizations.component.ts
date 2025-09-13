import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-admin-organizations',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './admin-organizations.component.html',
    styleUrl: './admin-organizations.component.scss'
})
export class AdminOrganizationsComponent {
    readonly breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb( ['Organizations']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
}
