import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';
import { SidebarSubMenuLinkComponent } from '../../common/sidebar/sidebar-submenu-link.component';

@Component({
    selector: 'app-settings-app',
    standalone: true,
    imports: [RouterOutlet, SidebarSubMenuLinkComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsAppComponent {
    readonly breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Settings']);
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
}
