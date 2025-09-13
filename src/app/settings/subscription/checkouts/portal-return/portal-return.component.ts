import { Component, inject } from '@angular/core';
import {  Router  } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../services/api/auth.service';

@Component({
    standalone: true,
    selector: 'app-settings-subscription-portal-return-page',
    template: '',
    imports: [MatProgressSpinnerModule]
})
export class SubscriptionPortalCheckoutReturnPage {
    authService = inject(AuthService);
    router = inject(Router);

    async ngOnInit() {
        await this.authService.sbService.client.auth.refreshSession();
        this.router.navigateByUrl('/settings/subscription');
    }
}
