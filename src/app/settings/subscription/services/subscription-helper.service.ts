import { Injectable } from '@angular/core';
import { OrgSubscription } from '../api/models/subscription';
import { SubscriptionStatus } from '../api/models/subscription-status';
import { SubscriptionPlan } from '../api/models/subscription-plan';
import { getDateDayDiff } from '../../../shared/utils/date-utils';
import { BillingPeriod } from '../api/models/billing-period';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionHelperService {
    getCurrentSubNameFormatted(
        subscription: OrgSubscription | null,
        plan: SubscriptionPlan | null,
        mtuCount: number | null
    ): string | null {
        if (!subscription || !plan?.name) {
            return null;
        }

        const planName = plan.name;
        const components: string[] = [planName];

        let formattedMtu: string | null = null;
        let statusOrIntervalString: string | null = null;

        if (mtuCount !== null) {
            formattedMtu = this.formatMTU(mtuCount);
            components.push(`${formattedMtu} MTUs`);
        }

        if (subscription.status === SubscriptionStatus.Startup) {
            return `Startup Program, ${formattedMtu !== null ? `Free up to ${formattedMtu} MTUs` : 'Free'}`;
        }

        if (subscription.status === SubscriptionStatus.Trial) {
            const currentStartEnd = this.getCurrentPeriodSubscriptionStartEndDates(subscription);

            statusOrIntervalString = 'Free Trial';
            if (currentStartEnd) {
                const days = getDateDayDiff(currentStartEnd.start, currentStartEnd.end);
                statusOrIntervalString = days > 0 ? `${days}-day Free Trial` : 'Free Trial';
            }
        } else {
            const price = plan.prices?.find(p => p.id === subscription.priceId);
            const interval = price?.interval;

            if (interval === BillingPeriod.Yearly) {
                statusOrIntervalString = 'Annual';
            } else if (interval === BillingPeriod.Monthly) {
                statusOrIntervalString = 'Monthly';
            }
        }

        let result = components.join(' ');

        if (statusOrIntervalString) {
            result += `, ${statusOrIntervalString}`;
        }

        if (result === planName && !statusOrIntervalString && components.length === 1) {
            return planName;
        }

        return result;
    }

    canCancelTheSubscription(subscription: OrgSubscription | null): boolean {
        if (subscription === null) return false;

        return subscription.cancelAtPeriodEnd === false && this.hasStripeManagableSubscriptionStatus(subscription)
    }

    hasStripeNonManagableSubscriptionStatus(subscription: OrgSubscription | null): boolean {
        return (
            !!subscription &&
            (subscription.status === SubscriptionStatus.Canceled ||
                subscription.status === SubscriptionStatus.Incomplete ||
                subscription.status === SubscriptionStatus.IncompleteExpired ||
                subscription.status === SubscriptionStatus.Trial ||
                subscription.status === SubscriptionStatus.Startup)
        );
    }

    hasStripeManagableSubscriptionStatus(subscription: OrgSubscription | null): boolean {
        return (
            !!subscription &&
            (subscription.status === SubscriptionStatus.Paused ||
                subscription.status === SubscriptionStatus.Unpaid ||
                subscription.status === SubscriptionStatus.PastDue ||
                subscription.status === SubscriptionStatus.Active)
        );
    }

    hasActiveSubscription(subscription: OrgSubscription | null): boolean {
        return (
            !!subscription &&
            (subscription.status === SubscriptionStatus.Trial ||
                subscription.status === SubscriptionStatus.Active ||
                subscription.status === SubscriptionStatus.Startup)
        );
    }

    hasCanceledSubscription(subscription: OrgSubscription | null) {
        return (
            subscription?.status === SubscriptionStatus.Canceled ||
            subscription?.cancelAtPeriodEnd === true
        );
    }

    hasActivePaidSubscription(subscription: OrgSubscription | null): boolean {
        return subscription?.status === SubscriptionStatus.Active;
    }

    getCurrentPeriodSubscriptionStartEndDates(subscription: OrgSubscription | null): {
        start: Date;
        end: Date;
    } | null {
        if (!subscription) return null;

        if (subscription.status === SubscriptionStatus.Trial) {
            if (!subscription.trialStarted || !subscription.trialEnded) return null;

            return {
                start: new Date(subscription.trialStarted),
                end: new Date(subscription.trialEnded)
            };
        }

        if (!subscription.currentPeriodStart || !subscription.currentPeriodEnd) return null;

        return {
            start: new Date(subscription.currentPeriodStart),
            end: new Date(subscription.currentPeriodEnd)
        };
    }

    private formatMTU(amount: number): string {
        if (amount >= 1000) {
            return `${Math.round(amount / 1000)}k`;
        }
        return amount.toString();
    }
}
