import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SubscriptionPlanCard } from '../../api/models/subscription-plan';
import { OrgSubscription } from '../../api/models/subscription';
import { getDateDayDiff } from '../../../../shared/utils/date-utils';
import { BillingPeriod } from '../../api/models/billing-period';
import { PricingCalculationService } from '../../services/pricing-calculation.service';
import { ProductKey } from '../../api/models/product-key';
import { SubscriptionStatus } from '../../api/models/subscription-status';
import { SubscriptionHelperService } from '../../services/subscription-helper.service';
import { CentsPipe } from '../../../../shared/pipes/cents.pipe';

declare const Calendly: any;

export enum PlanCardAction {
    Manage = 'Manage',
    Subscribe = 'Subscribe',
    ChangePlan = 'ChangePlan',
    BookDemo = 'BookDemo'
}

@Component({
    standalone: true,
    selector: 'app-pricing-card',
    templateUrl: './pricing-card.component.html',
    styleUrl: './pricing-card.component.scss',
    imports: [
        MatCardModule,
        MatIconModule,
        CurrencyPipe,
        MatButtonModule,
        MatTooltipModule,
        MatDividerModule,
        CentsPipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingCardComponent {
    private pricingCalculationService = inject(PricingCalculationService);
    private subscriptionHelperService = inject(SubscriptionHelperService);

    currency = input<'usd' | 'eur'>('usd');
    billingPeriod = input<BillingPeriod>(BillingPeriod.Monthly);
    subPlanCard = input.required<SubscriptionPlanCard>();
    subscription = input<OrgSubscription | null>();

    changePlan = output();
    managePlan = output();
    subscribe = output();

    keyENUM = ProductKey;
    PlanCardAction = PlanCardAction;

    selectedPrice = computed(() => {
        return this.pricingCalculationService.getSelectedPrice(
            this.subPlanCard(),
            this.billingPeriod()
        );
    });

    selectedCurrencyTier = computed(() => {
        return this.pricingCalculationService.getSelectedCurrencyTier(
            this.selectedPrice(),
            this.currency()
        );
    });

    // select for any status except startup
    selected = computed(() => {
        return (
            this.subscription()?.productId === this.subPlanCard().id &&
            this.subscription()?.status !== SubscriptionStatus.Startup
        );
    });

    isSelectedTrial = computed(() => {
        return this.selected() && this.isOnTrial();
    });

    isOnTrial = computed(() => {
        return this.subscription()?.status === SubscriptionStatus.Trial;
    });

    trialPeriodDays = computed(() => {
        const subscription = this.subscription();
        return subscription?.trialStarted && subscription?.trialEnded
            ? getDateDayDiff(new Date(subscription.trialStarted), new Date(subscription.trialEnded))
            : null;
    });

    flatAmount = computed(() => {
        const billingPeriod = this.billingPeriod();

        const amount = this.pricingCalculationService.getFlatAmount(
            this.selectedCurrencyTier(),
            this.selectedPrice()
        );

        if (billingPeriod === BillingPeriod.Yearly) {
            return amount / 12;
        }

        return amount;
    });

    hasExtraCharge = computed(() => {
        return this.pricingCalculationService.hasExtraCharge(this.selectedPrice());
    });

    extraCharge = computed(() => {
        return this.pricingCalculationService.getExtraCharge(this.selectedCurrencyTier());
    });

    onBookADemoClick() {
        Calendly.initPopupWidget({ url: 'https://calendly.com/artem-datopus/30min' });
    }

    currentPlanCardAction = computed((): PlanCardAction => {
        const currentSub = this.subscription();
        const planCard = this.subPlanCard();
    
        const isPlanSelected = currentSub?.productId === planCard.id;
        const isPlanScale = planCard.key === ProductKey.Scale;
        const managable = this.subscriptionHelperService.hasStripeManagableSubscriptionStatus(currentSub ?? null);
    
        if (isPlanScale) {
            if (isPlanSelected) {
                return managable ? PlanCardAction.Manage : PlanCardAction.BookDemo;
            } else {
                return PlanCardAction.BookDemo;
            }
        }
    
        if (managable) {
            return isPlanSelected ? PlanCardAction.Manage : PlanCardAction.ChangePlan;
        }
    
        return PlanCardAction.Subscribe;
    });

    handlePlanActionClick(): void {
        switch (this.currentPlanCardAction()) {
            case PlanCardAction.Manage:
                this.managePlan.emit();
                break;
            case PlanCardAction.Subscribe:
                this.subscribe.emit();
                break;
            case PlanCardAction.ChangePlan:
                this.changePlan.emit();
                break;
            case PlanCardAction.BookDemo:
                Calendly.initPopupWidget({ url: 'https://calendly.com/artem-datopus/30min' });
                break;
        }
    }
}
