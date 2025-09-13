import { Injectable, inject, signal } from '@angular/core';

import { SubscriptionApiService } from '../../settings/subscription/api/services/subscription.service';
import { OrgSubscription } from '../../settings/subscription/api/models/subscription';
import { PriceLookupKey } from '../../settings/subscription/api/models/price-lookup-keys';

export const SubscriptionHierarchy: Record<PriceLookupKey, PriceLookupKey[]> = {
    [PriceLookupKey.CollectMonthly]: [PriceLookupKey.CollectMonthly, PriceLookupKey.CollectYearly],
    [PriceLookupKey.CollectYearly]: [PriceLookupKey.CollectMonthly, PriceLookupKey.CollectYearly],
    [PriceLookupKey.OptimizeYearly]: [
        PriceLookupKey.CollectMonthly,
        PriceLookupKey.CollectYearly,
        PriceLookupKey.OptimizeMonthly,
        PriceLookupKey.OptimizeYearly
    ],
    [PriceLookupKey.OptimizeMonthly]: [
        PriceLookupKey.CollectMonthly,
        PriceLookupKey.CollectYearly,
        PriceLookupKey.OptimizeMonthly,
        PriceLookupKey.OptimizeYearly
    ],
    [PriceLookupKey.ScaleMonthly]: [
        PriceLookupKey.CollectMonthly,
        PriceLookupKey.CollectYearly,
        PriceLookupKey.OptimizeMonthly,
        PriceLookupKey.OptimizeYearly,
        PriceLookupKey.ScaleMonthly,
        PriceLookupKey.ScaleYearly
    ],
    [PriceLookupKey.ScaleYearly]: [
        PriceLookupKey.CollectMonthly,
        PriceLookupKey.CollectYearly,
        PriceLookupKey.OptimizeMonthly,
        PriceLookupKey.OptimizeYearly,
        PriceLookupKey.ScaleMonthly,
        PriceLookupKey.ScaleYearly
    ]
};

@Injectable({
    providedIn: 'root'
})
export class UserSubscriptionService {
    private readonly apiService = inject(SubscriptionApiService);
    private subscription = signal<OrgSubscription | null>(null);

    hasAccess(
        userSubscriptionKey: PriceLookupKey,
        requiredSubscriptions: PriceLookupKey[],
        exact = false
    ): boolean {
        if (exact) return requiredSubscriptions.includes(userSubscriptionKey);

        return (
            requiredSubscriptions.some(subscription =>
                SubscriptionHierarchy[userSubscriptionKey]?.includes(subscription)
            ) ?? false
        );
    }

    async getUserSubscription(cached = false): Promise<OrgSubscription | null> {
        if (this.subscription() !== null && cached) return this.subscription();

        const subscription = await this.apiService.fetchUserSubscription();
        this.subscription.set(subscription);

        return subscription;
    }

    async cancelUserSubscription(subscription: OrgSubscription) {
        await this.apiService.cancelSubscription(subscription);
    }
}
