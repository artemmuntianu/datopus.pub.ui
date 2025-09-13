import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-settings-subscription',
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    imports: [RouterLink, RouterOutlet, MatCardModule, MatButtonModule, RouterLinkActive],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionSettingsComponent {
    allowedMenuRoutes = ['available-plans', '', 'subscription'];
    router = inject(Router);

    isRouteAllowed(): boolean {
        const currentRoute = this.router.url.split('/').pop();
        return this.allowedMenuRoutes.includes(currentRoute || '');
    }
}
