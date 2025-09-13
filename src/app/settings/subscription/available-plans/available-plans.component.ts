import { Component, signal, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PricingCardComponent } from './pricing-card/pricing-card.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { PlansService } from '../api/services/plans.service';
import { SubscriptionPlanCard } from '../api/models/subscription-plan';
import { OrgSubscription } from '../api/models/subscription';
import { Router } from '@angular/router';
import { BillingPeriod } from '../api/models/billing-period';
import { ProductKey } from '../api/models/product-key';
import { UserSubscriptionService } from '../../../shared/services/user-subscription.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
    standalone: true,
    selector: 'app-settings-subscription-available-plans',
    templateUrl: './available-plans.component.html',
    styleUrl: './available-plans.component.scss',
    imports: [
        MatCardModule,
        PricingCardComponent,
        MatButtonToggleModule,
        MatButtonModule,
        MatProgressSpinnerModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailablePlansComponent {
    router = inject(Router);
    userSubscriptionService = inject(UserSubscriptionService);
    plansService = inject(PlansService);
    toastrService = inject(ToastrService);
    selectedCurrency = signal<'usd' | 'eur'>('usd');
    selectedSubscriptionTimePlan = signal<BillingPeriod>(BillingPeriod.Monthly);
    subscription = signal<OrgSubscription | null>(null);
    billingPeriodENUM = BillingPeriod;
    loadingData = signal(false);

    subscriptionPlanCards = signal<SubscriptionPlanCard[]>([]);

    userPlan = computed(() => {
        return this.subscriptionPlanCards().find(p => p.id === this.subscription()?.productId);
    });

    aggregatedFeatures = computed(() => {
        const plans = this.subscriptionPlanCards();
        const selectedPlan = this.userPlan();

        const supportedKeys = [ProductKey.Collect];

        if (selectedPlan) {
            if ([ProductKey.Optimize, ProductKey.Scale].includes(selectedPlan.key)) {
                supportedKeys.push(ProductKey.Optimize);
            }
            if (selectedPlan.key === ProductKey.Scale) {
                supportedKeys.push(ProductKey.Scale);
            }
        }

        const supportedPlans = plans.filter(plan => supportedKeys.includes(plan.key));

        return supportedPlans.flatMap(plan => plan.features);
    });

    pricingPlansUITemplates = signal([
        {
            key: ProductKey.Collect,
            datasources: [
                {
                    name: 'Google Analytics',
                    icon: 'images/icons/external-reports/005-google-analytics.png'
                }
            ],
            featuresListTitle: {
                plan: 'Collect',
                prefix: 'Our',
                postfix: 'plan includes:'
            },
            features: [
                { name: 'White glove service', icon: 'hotel_class' },
                { name: 'Auto-track user actions' },
                { name: 'Dashboards' },
                { name: 'External reports' },
                { name: 'No user, session or event limits' }
            ]
        },
        {
            key: ProductKey.Optimize,
            datasources: [
                {
                    name: 'Google Analytics',
                    icon: 'images/icons/external-reports/005-google-analytics.png'
                },
                {
                    name: 'Google Big Query',
                    icon: 'images/icons/external-reports/google-bigquery-logo.svg'
                }
            ],
            featuresListTitle: {
                prefix: 'Everything in',
                plan: 'Collect',
                postfix: ', and:'
            },
            features: [
                { name: '1,000 MTU included' },
                { name: 'Event-level reports' },
                { name: 'User-level reports' },
                { name: 'Feature-level reports' },
                { name: 'Advanced dashboards' },
                { name: 'Monitoring & alerting' },
                { name: '24 months data retention' }
            ]
        },
        {
            key: ProductKey.Scale,
            name: 'Premium B2B',
            description: 'Company-level analytics, for multi-tenant web apps',
            datasources: [
                {
                    name: 'Google Analytics',
                    icon: 'images/icons/external-reports/005-google-analytics.png'
                },
                {
                    name: 'Google Big Query',
                    icon: 'images/icons/external-reports/google-bigquery-logo.svg'
                }
            ],
            featuresListTitle: {
                prefix: 'Everything in',
                plan: 'Optimize',
                postfix: ', and:'
            },
            features: [
                { name: '1,000 MTU included' },
                { name: 'Company-level reports' },
                { name: 'Customer-facing dashboard' }
            ]
        }
    ]);

    async ngOnInit() {
        try {
            this.loadingData.set(true);

            const subscription = await this.userSubscriptionService.getUserSubscription();
            this.subscription.set(subscription);
            const plansListResponse = await this.plansService.getPlans();

            const planTemplates = this.pricingPlansUITemplates();

            const cards: SubscriptionPlanCard[] = plansListResponse
                .sort((p1, p2) => {
                    const order1 = parseFloat(p1.metadata['order']) || 0;
                    const order2 = parseFloat(p2.metadata['order']) || 0;
                    return order1 - order2;
                })
                .map(plan => {
                    const template = planTemplates.find(t => t.key === plan.key);

                    return new SubscriptionPlanCard(plan, {
                        datasources: template?.datasources ?? [],
                        features: template?.features ?? [],
                        featuresTitle: template?.featuresListTitle ?? {
                            plan: 'Uknown',
                            prefix: 'Unknown',
                            postfix: 'Unknown'
                        }
                    });
                });

            this.subscriptionPlanCards.set(cards);
        } catch (err) {
            this.toastrService.error("An Error occured while fetching subscription data.");
        } finally {
            this.loadingData.set(false);
        }
    }

    navigateToPlanBuilder(planId: string) {
        this.router.navigateByUrl(`/settings/subscription/plan-builder/${planId}`);
    }

    onSubscriptionTimePlanChange(value: BillingPeriod) {
        this.selectedSubscriptionTimePlan.set(value);
    }

    onCurrencyChange(value: 'eur' | 'usd') {
        this.selectedCurrency.set(value);
    }
}
