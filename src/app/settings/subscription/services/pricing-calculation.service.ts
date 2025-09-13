import { Injectable } from '@angular/core';
import { BillingPeriod } from '../api/models/billing-period';
import { OrgSubscription } from '../api/models/subscription';
import {
    SubscriptionPlan,
    SubscriptionPlanCard,
    SubscriptionPrice,
    SubscriptionPriceTier
} from '../api/models/subscription-plan';
import { PricingType } from '../api/models/pricing-type';
import { ProductKey } from '../api/models/product-key';

@Injectable({
    providedIn: 'root'
})
export class PricingCalculationService {

    // NOTE: this doesn't respect difference in MTU price between Yearly and Monthly prices
    calculatePriceDifferenceBetweenMonthAndYearBillingTypes(
        prices: SubscriptionPrice[],
        currency: 'usd' | 'eur'
    ) {
        const yearPrice = prices.find(p => p.interval === BillingPeriod.Yearly);
        const monthPrice = prices.find(p => p.interval === BillingPeriod.Monthly);

        if (!yearPrice || !monthPrice) return null;

        const yearAmount = yearPrice.currencyTiers[currency]?.[0]?.flatAmountDecimal ?? 0;
        const monthAmount = monthPrice.currencyTiers[currency]?.[0]?.flatAmountDecimal ?? 0;

        return monthAmount * 12 - yearAmount;
    }

    newPlanSupportsMTU(plan: SubscriptionPlan | null): boolean {
        return plan?.key === ProductKey.Optimize || plan?.key === ProductKey.Scale;
    }

    currentSubMTU(
        plan: SubscriptionPlan | null,
        subscription: OrgSubscription | null
    ): number | null {
        if (plan?.key === ProductKey.Optimize || plan?.key === ProductKey.Scale) {
            return subscription?.quantity ?? null;
        }

        return null;
    }

    getSelectedPrice(
        plan: SubscriptionPlan | SubscriptionPlanCard | null,
        selectedSubscriptionTimePlan: BillingPeriod | null
    ): SubscriptionPrice | null {
        return plan?.prices.find(p => p.interval === selectedSubscriptionTimePlan) ?? null;
    }

    getTotal(estimates: any): number | null {
        return estimates ? estimates.totalAmount + estimates.taxAmountExclusive : null;
    }

    getYearlyDiscountAmountPercents(plan: SubscriptionPlan | null): string | null {
        return plan?.metadata['yearly_discount_percentage'] ?? null;
    }

    getFlatAmount(selectedCurrencyTier: any, selectedPrice: any): number {
        let amount = 0;

        if (selectedPrice?.pricingType === PricingType.Graduated) {
            const firstItem = selectedCurrencyTier?.[0];
            amount = firstItem?.flatAmountDecimal || firstItem?.flatAmount || 0;
        } else {
            const price = selectedPrice;
            amount = price?.amountDecimal || price?.amount || 0;
        }

        return amount;
    }

    hasExtraCharge(selectedPrice: SubscriptionPrice | null): boolean {
        return selectedPrice?.pricingType === PricingType.Graduated;
    }

    getSelectedCurrencyTier(
        selectedPrice: SubscriptionPrice | null,
        selectedCurrency: 'usd' | 'eur'
    ): SubscriptionPriceTier[] | null {
        return selectedPrice?.currencyTiers[selectedCurrency] ?? null;
    }

    getExtraCharge(selectedCurrencyTier: any): number {
        if (!selectedCurrencyTier) {
            return 0;
        }
        const secondItem = selectedCurrencyTier?.[1];
        return secondItem?.unitAmountDecimal || secondItem?.unitAmount || 0;
    }
}
