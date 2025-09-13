import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-settings-account',
    standalone: true,
    imports: [RouterLink, RouterOutlet, MatCardModule, MatButtonModule, RouterLinkActive],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsAccountComponent {
   readonly breadcrumbService = inject(BreadcrumbService);

    ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb(['Account', 'Settings']);
    }
    
    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }
}
