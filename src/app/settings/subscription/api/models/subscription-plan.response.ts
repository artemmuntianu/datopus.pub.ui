import { SubscriptionPrice } from './subscription-plan';

export interface PlanResponse {
    id: string;
    name: string;
    description: string;
    metadata: Record<string, string>;
    prices: SubscriptionPrice[];
}

export interface TaxEstimateResponse {
    subTotalAmount: number;
    totalAmount: number;
    taxAmountExclusive: number;
    taxAmountInclusive: number;
}

export interface EstimateResponse {
    subtotal: number;
    taxes: number;
    totalDueToday: number;
    dueDate: Date;
    totalDueNextBilling: number;
    nextPaymentDate?: Date;
    periodStart: Date;
    periodEnd: Date;
    items: InvoiceItem[];
}

export interface InvoiceItem {
    description: string;
    amount: number;
    quantity?: number;
    interval: string;
    isProration: boolean;
    tiers: TieredPricing[];
}

export interface TieredPricing {
    upTo?: number;
    unitAmount?: number;
}
