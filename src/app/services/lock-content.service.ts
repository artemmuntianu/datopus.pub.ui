import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { User } from './api/models';
import { OneDayMs } from '../consts';
import { UserSubscriptionService } from '../shared/services/user-subscription.service';
import { PriceLookupKey } from '../settings/subscription/api/models/price-lookup-keys';

@Injectable({
    providedIn: 'root'
})
export class LockContentService {
    areLocksVisible: WritableSignal<boolean>;
    userSubscriptionService = inject(UserSubscriptionService);
    private user = User.current!;

    private premiumRoutes = [
        '/dashboard/:dashboardId',
        '/dashboard/:dashboardId/report/:reportId',
        '/reports/features/flow',
        '/reports/features/usage',
        '/reports/features/flow-demo',
        '/reports/features/usage-demo',
        '/reports/features/events',
        '/reports/insights',
        '/admin/organizations',
        '/admin/users',
        '/admin/monitors',
        '/session-replay',
        '/settings/app/connections/new-bq',
        '/ask-data'
    ];
    private premiumRouteRegexes: RegExp[];

    constructor() {
        const lsContentLocksHiddenUntil = localStorage.getItem('content_locks_hidden_until');
        this.areLocksVisible = signal(
            lsContentLocksHiddenUntil ? new Date() > new Date(+lsContentLocksHiddenUntil) : true
        );

        this.premiumRouteRegexes = this.premiumRoutes.map(
            route => new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$')
        );
    }

    isLocked(route: string): boolean {
        if (!this.userSubscriptionService.hasAccess(this.user.orgSubscription, [PriceLookupKey.OptimizeMonthly])) {
            return this.premiumRouteRegexes.some(regex => regex.test(route));
        }
        return false;
    }

    setLocksVisibility(visible: boolean) {
        if (visible) {
            localStorage.removeItem('content_locks_hidden_until');
        } else {
            localStorage.setItem(
                'content_locks_hidden_until',
                new Date(new Date().getTime() + 7 * OneDayMs).getTime().toString()
            );
        }
        this.areLocksVisible.set(visible);
    }
}
