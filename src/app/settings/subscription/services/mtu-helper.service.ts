import { Injectable } from '@angular/core';
import { OrgSubscription } from '../api/models/subscription';

export interface MTUCycleDates {
    start: Date;
    end: Date;
    daysLeft: number;
}

@Injectable({
    providedIn: 'root'
})
export class MTUHelperService {
    getCurrentMTUCycle(subscription: OrgSubscription | null): MTUCycleDates | null {
        if (!subscription) return null;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const planUpdatedAt = new Date(subscription.plan_updated_at);

        const start = planUpdatedAt.getMonth() === now.getMonth()
            ? planUpdatedAt
            : startOfMonth;

        const daysLeft = Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        return { start, end: endOfMonth, daysLeft };
    }
}
