import { OrgType } from '../../../../enums';
import { BillingPeriod } from './billing-period';
import { ProductKey } from './product-key';

export class SubscriptionPlan {
    id: string;
    key: ProductKey;
    orgType: OrgType;
    type: 'pro' | 'premium';
    name: string;
    description: string;
    prices: SubscriptionPrice[];
    metadata: Record<string, string>;

    constructor(plan: {
        id: string;
        key: ProductKey;
        orgType: OrgType;
        type: 'pro' | 'premium';
        name: string;
        description: string;
        prices: SubscriptionPrice[];
        metadata: Record<string, string>;
    }) {
        this.id = plan.id;
        this.key = plan.key;
        this.orgType = plan.orgType;
        this.type = plan.type;
        this.name = plan.name;
        this.description = plan.description;
        this.prices = plan.prices;
        this.metadata = plan.metadata;
    }
}

export class SubscriptionPlanCard {
    private plan: SubscriptionPlan;

    datasources: { name: string; icon?: string }[];
    features: { name: string; icon?: string }[];
    featuresTitle: {
        plan: string;
        prefix: string;
        postfix: string;
    };

    constructor(
        plan: SubscriptionPlan,
        ui: {
            datasources: { name: string; icon?: string }[];
            features: { name: string; icon?: string }[];
            featuresTitle: { plan: string; prefix: string; postfix: string };
        }
    ) {
        this.plan = plan;
        this.datasources = ui.datasources;
        this.features = ui.features;
        this.featuresTitle = ui.featuresTitle;
    }

    get id() {
        return this.plan.id;
    }
    get name() {
        return this.plan.name;
    }
    get description() {
        return this.plan.description;
    }
    get prices() {
        return this.plan.prices;
    }
    get metadata() {
        return this.plan.metadata;
    }
    get key() {
        return this.plan.key;
    }
}

export interface SubscriptionPrice {
    id: string;
    amount?: number;
    amountDecimal?: number;
    currency: string;
    interval: BillingPeriod;
    pricingType: string;
    tiers: SubscriptionPriceTier[];
    currencyTiers: Record<string, SubscriptionPriceTier[]>;
}

export interface SubscriptionPriceTier {
    upTo: string;
    unitAmount: number;
    flatAmount: number;
    flatAmountDecimal: number;
    unitAmountDecimal: number;
}
