import { Database } from '../../../../../../database.types';
import { SubscriptionStatus } from './subscription-status';

export class OrgSubscription {
    constructor(
        public id: number,
        public startDate: string,
        public mtu_limit_exceeded: boolean,
        public plan_updated_at: string,
        public cancelAtPeriodEnd?: boolean,
        public canceledAt?: string,
        public createdAt?: string,
        public currency?: "usd" | "eur",
        public endDate?: string,
        public orgId?: number,
        public priceId?: string,
        public status?: SubscriptionStatus,
        public stripeCustomerId?: string,
        public stripeSubscriptionId?: string,
        public trialEnded?: string,
        public trialStarted?: string,
        public quantity?: number,
        public updatedAt?: string,
        public productId?: string,
        public currentPeriodStart?: string,
        public currentPeriodEnd?: string,

    ) { }

    static fromApi(data: Database['public']['Tables']['subscription']['Row']): OrgSubscription {
        return new OrgSubscription(
            data.id,
            data.start_date,
            data.mtu_limit_exceeded,
            data.plan_updated_at,
            data.cancel_at_period_end ?? undefined,
            data.canceled_at ?? undefined,
            data.created_at ?? undefined,
            data.currency as "usd" | "eur" ?? undefined,
            data.end_date ?? undefined,
            data.org_id ?? undefined,
            data.price_id ?? undefined,
            data.status as SubscriptionStatus ?? undefined,
            data.stripe_customer_id ?? undefined,
            data.stripe_subscription_id ?? undefined,
            data.trial_ended ?? undefined,
            data.trial_started ?? undefined,
            data.quantity ?? undefined,
            data.updated_at ?? undefined,
            data.product_id ?? undefined,
            data.current_period_start ?? undefined,
            data.current_period_end ?? undefined,
        );
    }
}
