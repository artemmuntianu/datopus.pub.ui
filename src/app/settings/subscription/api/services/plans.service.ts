import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../services/api/auth.service';
import {
    EstimateResponse,
    PlanResponse,
    TaxEstimateResponse
} from '../models/subscription-plan.response';
import { SubscriptionPlan } from '../models/subscription-plan';
import { BillingPeriod } from '../models/billing-period';
import { OrgType } from '../../../../enums';
import { ProductKey } from '../models/product-key';

@Injectable({
    providedIn: 'root'
})
export class PlansService {
    authService = inject(AuthService);

    constructor(private http: HttpClient) {}

    calculateBillingPeriodDates(period: BillingPeriod) {
        const startDate = new Date();
        const endDate = new Date(startDate);

        switch (period) {
            case BillingPeriod.Monthly: {
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            }
            case BillingPeriod.Yearly: {
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            }
        }
        return { start: startDate, end: endDate };
    }

    async getPlans() {
        try {
            const plans = await firstValueFrom(
                this.http.get<PlanResponse[]>(
                    `${env.apiBaseUrl}/subscriptions/plans`,

                    { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                )
            );
            return plans.map(this.mapSubscriptionPlanResponse);
        } catch (err) {
            return [];
        }
    }

    async getPlanById(planId: string) {
        try {
            const plan = await firstValueFrom(
                this.http.get<PlanResponse>(
                    `${env.apiBaseUrl}/subscriptions/plans/${planId}`,

                    { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                )
            );
            return this.mapSubscriptionPlanResponse(plan);
        } catch {
            return null;
        }
    }

    async getNewPlanTaxRates(productId: string, currency: string, quantity: number) {
        try {
            const estimates = await firstValueFrom(
                this.http.post<TaxEstimateResponse>(
                    `${env.apiBaseUrl}/subscriptions/estimate-taxes`,
                    {
                        product_id: productId,
                        currency,
                        quantity
                    },
                    { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                )
            );
            return estimates;
        } catch {
            return null;
        }
    }

    async getInvoicePreview(
        priceId: string,
        currency: string,
        quantity: number,
        skipBillingCycleAnchor = false
    ) {
        try {
            const estimates = await firstValueFrom(
                this.http.post<EstimateResponse>(
                    `${env.apiBaseUrl}/subscriptions/envoice-preview`,
                    {
                        price_id: priceId,
                        currency,
                        quantity,
                        skip_billing_cycle_anchor: skipBillingCycleAnchor
                    },
                    { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                )
            );
            return estimates;
        } catch {
            return null;
        }
    }

    async getProratedInvoicePreview(
        customerId: string,
        subscriptionId: string,
        currentPriceId: string,
        newPriceId: string,
        quantity: number
    ) {
        try {
            const proratesResponse = await firstValueFrom(
                this.http.post<EstimateResponse>(
                    `${env.apiBaseUrl}/subscriptions/prorated-estimate`,
                    {
                        new_price_id: newPriceId,
                        current_price_id: currentPriceId,
                        customer_id: customerId,
                        subscription_id: subscriptionId,
                        quantity: quantity
                    },
                    { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                )
            );
            return proratesResponse;
        } catch {
            return null;
        }
    }

    async changePlan(subscriptionId: string, priceId: string, quantity: number) {
        const response = await firstValueFrom(
            this.http.post<void>(
                `${env.apiBaseUrl}/subscriptions/change-plan`,
                {
                    subscription_id: subscriptionId,
                    price_id: priceId,
                    quantity
                },
                { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
            )
        );
        return response;
    }

    private mapSubscriptionPlanResponse(planResponse: PlanResponse) {
        const key = planResponse.metadata['key'];

        return new SubscriptionPlan({
            id: planResponse.id,
            key: key as ProductKey,
            description: planResponse.description,
            metadata: planResponse.metadata,
            name: planResponse.name,
            orgType: planResponse.metadata['orgType'] as OrgType,
            prices: planResponse.prices,
            type: planResponse.metadata['type'] as 'premium' | 'pro'
        });
    }
}
