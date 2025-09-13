import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../../../services/api/models';
import { SupabaseService } from '../../../../services/supabase/supabase.service';
import { OrgSubscription } from '../models/subscription';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/api/auth.service';
import { firstValueFrom } from 'rxjs';
import { env } from '../../../../../environments/environment';
import { SubscriptionStatus } from '../models/subscription-status';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionApiService {
    private readonly sbService = inject(SupabaseService);
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    async fetchUserSubscription() {
        const { data, error } = await this.sbService.client
            .rpc("get_subscription_checked", {in_org_id: User.current!.orgId});

        if (error || data === null) {
            return null;
        }
        return OrgSubscription.fromApi(data);
    }

    async cancelSubscription(subscription: OrgSubscription) {
        if (subscription.status !== SubscriptionStatus.Active) {
            return;
        }

        await firstValueFrom(
            this.http.post<void>(
                `${env.apiBaseUrl}/subscriptions/cancel`,
                {
                    subscriptionId: subscription.stripeSubscriptionId
                },
                { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
            )
        );
    }

    async getUserSubscriptionDetails(
    ) {
        const details = await firstValueFrom(
            this.http.get<unknown>(
                `${env.apiBaseUrl}/subscriptions`,

                { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
            )
        );
        return details;
    }
}
