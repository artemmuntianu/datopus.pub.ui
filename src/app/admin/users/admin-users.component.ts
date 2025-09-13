import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './admin-users.component.html',
    styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent {
    readonly breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb( ['Users']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
}
