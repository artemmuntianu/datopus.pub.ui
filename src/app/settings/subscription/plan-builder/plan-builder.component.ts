import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { PlanExpainerDialogComponent } from './how-to-choose-plan-explainer-dialog/plan-explainer-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService } from '../api/services/plans.service';
import { catchError, debounceTime, filter, from, of, Subject, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EstimateResponse } from '../api/models/subscription-plan.response';
import { OrgSubscription } from '../api/models/subscription';
import { CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { CheckoutService } from '../api/services/checkout.service';
import { BillingPeriod } from '../api/models/billing-period';
import { PricingType } from '../api/models/pricing-type';
import { SubscriptionPlan } from '../api/models/subscription-plan';
import { BillingDetails } from '../api/models/billing-details';
import { ToastrService } from 'ngx-toastr';
import { MatExpansionModule } from '@angular/material/expansion';
import { PeriodPipe } from '../../../shared/pipes/period.pipe';
import { PricingCalculationService } from '../services/pricing-calculation.service';
import { SubscriptionStatus } from '../api/models/subscription-status';
import { UserSubscriptionService } from '../../../shared/services/user-subscription.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubscriptionHelperService } from '../services/subscription-helper.service';
import { MatIconModule } from '@angular/material/icon';
import { SubscriptionStatusPipe } from '../../../shared/pipes/sub-status.pipe';
import { CentsPipe } from '../../../shared/pipes/cents.pipe';
import { debounceTimeAfter } from '../../../shared/rxjs-operators/debounce-after';

// TODO: store in db
const FREE_MTU_PER_MONTH = 1000;
const FREE_MTU_PER_YEAR = 12000;

const MAX_MTU_AMOUNT = 300000;
declare const Calendly: any;

@Component({
    selector: 'app-plan-builder',
    templateUrl: './plan-builder.component.html',
    styleUrl: './plan-builder.component.scss',
    standalone: true,
    imports: [
        MatButtonModule,
        MatButtonToggleModule,
        MatRadioModule,
        MatDividerModule,
        MatSliderModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        DatePipe,
        CurrencyPipe,
        MatIconModule,
        PeriodPipe,
        DecimalPipe,
        CentsPipe,
        SubscriptionStatusPipe
    ]
})
export class PlanBuilderComponent {
    private dialog = inject(MatDialog);
    private route = inject(ActivatedRoute);
    private plansService = inject(PlansService);
    private pricingCalculationService = inject(PricingCalculationService);
    private checkoutService = inject(CheckoutService);
    private userSubscriptionService = inject(UserSubscriptionService);
    private subscriptionHelperService = inject(SubscriptionHelperService);

    private toastrService = inject(ToastrService);
    private router = inject(Router);

    private readonly debounceDuration = 1000;

    newPlan = signal<SubscriptionPlan | null>(null);
    currentPlan = signal<SubscriptionPlan | null>(null);
    currentSubscription = signal<OrgSubscription | null>(null);

    loadingSubscription = signal(false);
    loadingCurrentPlan = signal(false);
    loadingCurrentBillingDetails = signal(false);

    loadingNewPlan = signal(false);
    loadingNewPlanBillingDetails = signal(false);

    newPlanBillingDetails = signal<BillingDetails | null>(null);
    newPlanTotalDetails = signal<BillingDetails | null>(null);

    currentBillingTotalDetails = signal<BillingDetails | null>(null);
    billingPeriodENUM = BillingPeriod;

    selectedSubscriptionTimePlan = signal<BillingPeriod>(BillingPeriod.Monthly);
    selectedMTUAmount = signal(FREE_MTU_PER_MONTH);
    selectedCurrency = signal<'usd' | 'eur'>('usd');

    maxMTUAmount = signal(MAX_MTU_AMOUNT);

    currentSubName = computed(() => {
        const plan = this.currentPlan();
        const subscription = this.currentSubscription();
        return this.subscriptionHelperService.getCurrentSubNameFormatted(
            subscription,
            plan,
            this.pricingCalculationService.currentSubMTU(plan, subscription)
        );
    });

    newPlanSupportsMTU = computed(() =>
        this.pricingCalculationService.newPlanSupportsMTU(this.newPlan())
    );

    currentSubMTU = computed(() =>
        this.pricingCalculationService.currentSubMTU(this.currentPlan(), this.currentSubscription())
    );

    selectedPrice = computed(() =>
        this.pricingCalculationService.getSelectedPrice(
            this.newPlan(),
            this.selectedSubscriptionTimePlan()
        )
    );

    hasNonManagableSubscriptionStatus = computed(() => {
        return this.subscriptionHelperService.hasStripeNonManagableSubscriptionStatus(
            this.currentSubscription()
        );
    });

    hasManagableSubscriptionStatus = computed(() => {
        return this.subscriptionHelperService.hasStripeManagableSubscriptionStatus(
            this.currentSubscription()
        );
    });

    hasManagableCanceledSubscription = computed(() => {
        // canceled but subscription time is not yet expired
        return this.hasActivePaidSubscription() && this.hasCanceledSubscription();
    });

    hasActiveSubscription = computed(() =>
        this.subscriptionHelperService.hasActiveSubscription(this.currentSubscription())
    );

    hasActivePaidSubscription = computed(() =>
        this.subscriptionHelperService.hasActivePaidSubscription(this.currentSubscription())
    );

    hasCanceledSubscription = computed(() =>
        this.subscriptionHelperService.hasCanceledSubscription(this.currentSubscription())
    );

    yearlyDiscountAmountPercents = computed(() =>
        this.pricingCalculationService.getYearlyDiscountAmountPercents(this.newPlan())
    );

    yearlyPriceDifference = computed(() => {
        const newPlan = this.newPlan();
        const currency = this.selectedCurrency();
        return newPlan && currency
            ? this.pricingCalculationService.calculatePriceDifferenceBetweenMonthAndYearBillingTypes(
                  newPlan.prices,
                  currency
              )
            : null;
    });

    currentSubscriptionStartEndDates = computed(() =>
        this.subscriptionHelperService.getCurrentPeriodSubscriptionStartEndDates(
            this.currentSubscription()
        )
    );

    currentSubscriptionDetails = computed(() => {
        const plan = this.currentPlan();
        const subscription = this.currentSubscription();

        if (
            subscription?.status === SubscriptionStatus.Trial ||
            subscription?.status == SubscriptionStatus.Startup
        )
            return null;

        const price = plan?.prices.find(p => p.id === subscription?.priceId);

        if (!price) return null;

        const tier = this.pricingCalculationService.getSelectedCurrencyTier(
            price,
            price?.currency as 'usd' | 'eur'
        );

        return {
            name: plan?.name,
            flatAmount: this.pricingCalculationService.getFlatAmount(tier, price),
            hasExtraCharge: this.pricingCalculationService.hasExtraCharge(price),
            extraCharge: this.pricingCalculationService.getExtraCharge(tier),
            currency: price?.currency,
            interval: price?.interval
        };
    });

    newSubscriptionDetails = computed(() => {
        const plan = this.newPlan();
        const price = this.selectedPrice();
        const currency = this.selectedCurrency();

        if (!price) return null;

        const tier = this.pricingCalculationService.getSelectedCurrencyTier(price, currency);

        return {
            name: plan?.name,
            flatAmount: this.pricingCalculationService.getFlatAmount(tier, price),
            hasExtraCharge: this.pricingCalculationService.hasExtraCharge(price),
            extraCharge: this.pricingCalculationService.getExtraCharge(tier),
            currency: currency,
            interval: price?.interval
        };
    });

    selectedCurrencyTier = computed(() =>
        this.pricingCalculationService.getSelectedCurrencyTier(
            this.selectedPrice(),
            this.selectedCurrency()
        )
    );

    minMTUAmount = computed(() => {
        if (
            this.newPlanSupportsMTU() &&
            this.selectedSubscriptionTimePlan() === BillingPeriod.Yearly
        ) {
            return FREE_MTU_PER_YEAR;
        } else {
            return FREE_MTU_PER_MONTH;
        }
    });

    currencyChangeSubject = new Subject<'usd' | 'eur'>();
    mtuChangeSubject = new Subject<number>();
    timePlanChangeSubject = new Subject<BillingPeriod>();

    constructor() {
        this.currencyChangeSubject
            .asObservable()
            .pipe(
                filter(value => value !== undefined),
                debounceTimeAfter(1, this.debounceDuration),
                takeUntilDestroyed()
            )
            .subscribe(value => {
                this.selectedCurrency.set(value);
            });

        this.mtuChangeSubject
            .asObservable()
            .pipe(debounceTime(this.debounceDuration), takeUntilDestroyed())
            .subscribe(amount => {
                this.selectedMTUAmount.set(amount);
            });

        this.timePlanChangeSubject
            .asObservable()
            .pipe(debounceTimeAfter(1, this.debounceDuration), takeUntilDestroyed())
            .subscribe(interval => {
                this.selectedSubscriptionTimePlan.set(interval);
            });

        this.initializePlan();

        effect(
            async () => {
                const currentSubscription = this.currentSubscription();
                const newPlan = this.newPlan();

                if (!currentSubscription || !newPlan) return;

                await this.fetchNewPlanBillingDetails(currentSubscription, newPlan);
            },
            { allowSignalWrites: true }
        );

        effect(
            () => {
                const minMTU = this.minMTUAmount();
                if (untracked(this.selectedMTUAmount) < minMTU) {
                    this.selectedMTUAmount.set(minMTU);
                }
            },
            { allowSignalWrites: true }
        );
    }

    async ngOnInit() {
        await this.loadSubscription();

        const subscription = this.currentSubscription();

        if (subscription) {
            this.fetchCurrentBillingDetails(subscription);
        }

        if (subscription?.productId) {
            const currentPlan = await this.plansService.getPlanById(subscription.productId);
            this.currentPlan.set(currentPlan);
        }
    }

    navigateToSubscriptionPage() {
        this.router.navigateByUrl('/settings/subscription');
    }

    contactSales() {
        Calendly.initPopupWidget({ url: 'https://calendly.com/artem-datopus/30min' });
    }

    formatLabel(value: number): string {
        return value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`;
    }

    openExplainerDialog() {
        this.dialog.open(PlanExpainerDialogComponent, {
            maxWidth: '600px',
            backdropClass: 'dashboard-dialog-backdrop'
        });
    }

    changeTimePlan(value: BillingPeriod) {
        this.timePlanChangeSubject.next(value);
    }

    changeCurrency(value: 'usd' | 'eur') {
        this.currencyChangeSubject.next(value);
    }

    changeSelectedMTU(amount: number) {
        this.mtuChangeSubject.next(amount);
    }

    async changePlan() {
        try {
            await this.checkoutService.createPortalSession('update');
        } catch (err) {
            this.toastrService.error(
                'An Error occured during creaion of the portal session. Please try again.'
            );
        }
    }

    goToCheckout() {
        this.checkoutPayment();
    }

    private async loadSubscription() {
        try {
            this.loadingSubscription.set(true);

            const subscription = await this.userSubscriptionService.getUserSubscription();

            if (subscription?.currency) {
                this.selectedCurrency.set(subscription.currency);
            }

            this.currentSubscription.set(subscription);
        } catch (err) {
            this.toastrService.error('An Error occured while fetching the subscription.');
        } finally {
            this.loadingSubscription.set(false);
        }
    }

    private initializePlan() {
        this.route.paramMap
            .pipe(
                takeUntilDestroyed(),
                tap(() => {
                    this.loadingNewPlan.set(true);
                }),
                switchMap(params => {
                    const productId = params.get('productId');

                    if (!productId) {
                        return of(null);
                    }

                    return from(this.plansService.getPlanById(productId)).pipe(
                        catchError(error => {
                            console.error(error);
                            this.toastrService.error('Failed to load plan. Please try again.');
                            return of(null);
                        })
                    );
                }),
                tap(() => {
                    this.loadingNewPlan.set(false);
                })
            )
            .subscribe(plan => {
                this.newPlan.set(plan);
            });
    }

    private async checkoutPayment() {
        const newPlan = this.newPlan();
        const selectedPrice = this.selectedPrice();

        if (!newPlan || !selectedPrice) return;

        await this.checkoutService.createCheckoutSession(
            selectedPrice.id,
            this.getNewPlanAmount(),
            this.selectedCurrency()
        );
    }

    private getNewPlanAmount() {
        if (this.pricingCalculationService.newPlanSupportsMTU(this.newPlan())) {
            return this.selectedMTUAmount();
        } else {
            return 1;
        }
    }

    private async fetchCurrentBillingDetails(subscription: OrgSubscription) {
        if (
            this.hasNonManagableSubscriptionStatus() ||
            !subscription.priceId ||
            !subscription.quantity ||
            !subscription.currency
        ) {
            this.currentBillingTotalDetails.set(null);
            return;
        }
        try {
            this.loadingCurrentBillingDetails.set(true);

            const invoice = await this.plansService.getInvoicePreview(
                subscription.priceId,
                subscription.currency,
                subscription.quantity,
                true
            );

            if (invoice) {
                this.currentBillingTotalDetails.set(
                    this.createBillingDetails(invoice, subscription.currency)
                );
            }
        } catch (err) {
            this.toastrService.error('An error occured while fetching billing details.');
        } finally {
            this.loadingCurrentBillingDetails.set(false);
        }
    }

    private async fetchNewPlanBillingDetails(
        subscription: OrgSubscription,
        newPlan: SubscriptionPlan
    ) {
        const price = newPlan.prices.find(p => p.interval === this.selectedSubscriptionTimePlan());
        const mtuAmount = this.selectedMTUAmount();
        const selectedCurrency = this.selectedCurrency();
        this.newPlanBillingDetails.set(null);

        if (!price) return;

        const quantity = price.pricingType === PricingType.Flat ? 1 : mtuAmount;

        try {
            this.loadingNewPlanBillingDetails.set(true);

            const [prorate, planPreview] = await Promise.all([
                this.hasManagableSubscriptionStatus()
                    ? this.getProratedInvoice(subscription, price.id, quantity)
                    : this.plansService.getInvoicePreview(price.id, selectedCurrency, quantity),
                this.plansService.getInvoicePreview(price.id, selectedCurrency, quantity, true)
            ]);

            if (prorate) {
                this.newPlanBillingDetails.set(
                    this.createBillingDetails(prorate, selectedCurrency)
                );
            }

            if (planPreview) {
                this.newPlanTotalDetails.set(
                    this.createBillingDetails(planPreview, selectedCurrency)
                );
            }
        } catch (err) {
            this.toastrService.error(
                'An Error occurred while fetching new plan billing details. Please try again.'
            );
        } finally {
            this.loadingNewPlanBillingDetails.set(false);
        }
    }

    private async getProratedInvoice(
        subscription: OrgSubscription,
        newPriceId: string,
        quantity: number
    ) {
        return this.plansService.getProratedInvoicePreview(
            subscription.stripeCustomerId!,
            subscription.stripeSubscriptionId!,
            subscription.priceId!,
            newPriceId,
            quantity
        );
    }

    private createBillingDetails(estimate: EstimateResponse, currency: string): BillingDetails {
        return new BillingDetails(
            estimate.subtotal ?? 0,
            estimate.taxes ?? 0,
            estimate.totalDueNextBilling ?? 0,
            currency,
            estimate.dueDate,
            estimate.totalDueToday ?? 0,
            estimate.nextPaymentDate,
            estimate.periodStart,
            estimate.periodEnd,
            estimate.items
        );
    }

    private async _changePlanManually() {
        const subscription = this.currentSubscription();
        const selectedPrice = this.selectedPrice();

        if (!subscription?.stripeSubscriptionId || !selectedPrice) {
            console.error('Invalid subscription or price details');
            return;
        }

        const quantity =
            selectedPrice.pricingType === PricingType.Flat ? 1 : this.selectedMTUAmount();

        try {
            await this.plansService.changePlan(
                subscription.stripeSubscriptionId,
                selectedPrice.id,
                quantity
            );
            this.toastrService.success('Subscription updated successfully!');
        } catch {
            this.toastrService.error('Failed to update subscription. Please try again.');
        }
    }
}
