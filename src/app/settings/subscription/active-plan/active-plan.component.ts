import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { OrgSubscription } from '../api/models/subscription';
import { PlansService } from '../api/services/plans.service';
import { SubscriptionPlan } from '../api/models/subscription-plan';
import { ProductKey } from '../api/models/product-key';
import { SubscriptionStatus } from '../api/models/subscription-status';
import {
    ConfirmDialogModel,
    ConfirmDialogComponent
} from '../../../common/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserSubscriptionService } from '../../../shared/services/user-subscription.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CheckoutService } from '../api/services/checkout.service';
import { MTUApiService } from '../api/services/mtu.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SubscriptionHelperService } from '../services/subscription-helper.service';
import { PricingCalculationService } from '../services/pricing-calculation.service';
import { SubscriptionStatusPipe } from '../../../shared/pipes/sub-status.pipe';
import { User } from '../../../services/api/models';
import { MTUCycleDates, MTUHelperService } from '../services/mtu-helper.service';

@Component({
    standalone: true,
    selector: 'app-settings-subscription-active-plan',
    templateUrl: './active-plan.component.html',
    styleUrl: './active-plan.component.scss',
    imports: [
        MatCardModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        DecimalPipe,
        DatePipe,
        SubscriptionStatusPipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivePlanComponent {
    private subscriptionService = inject(UserSubscriptionService);
    private dialog = inject(MatDialog);
    private mtuService = inject(MTUApiService);
    private mtuHelperService = inject(MTUHelperService);
    private plansService = inject(PlansService);
    private toastrService = inject(ToastrService);
    private checkoutService = inject(CheckoutService);
    private subscriptionHelperService = inject(SubscriptionHelperService);
    private pricingCalculationService = inject(PricingCalculationService);

    subscriptionStatusENUM = SubscriptionStatus;
    loadingData = signal(false);

    currentPlan = signal<SubscriptionPlan | null>(null);

    userSubscription = signal<OrgSubscription | null>(null);
    mtuUsageAmount = signal<number | null>(null);

    mtuAvailableCount = signal<number | null>(null);

    currentSubName = computed(() => {
        const plan = this.currentPlan();
        const subscription = this.userSubscription();
        return this.subscriptionHelperService.getCurrentSubNameFormatted(
            subscription,
            plan,
            this.pricingCalculationService.currentSubMTU(plan, subscription)
        );
    });

    hasActiveSub = computed(()=> {
        const sub = this.currentSubStatus();

        return sub === SubscriptionStatus.Active || sub === SubscriptionStatus.Trial || sub === SubscriptionStatus.Startup;
    })

    supportsMtu = computed(()=> {
        return this.currentPlan()?.key === ProductKey.Optimize ||  this.currentPlan()?.key === ProductKey.Scale
    })

    currentSubStatus = computed(()=> {
        return this.userSubscription()?.status;
    })

    canCancelSubscription = computed(()=> {
        return this.subscriptionHelperService.canCancelTheSubscription(this.userSubscription())
    })

    isLimitExceeded = computed(()=> {
        const used = this.mtuUsageAmount();
        const available = this.mtuAvailableCount();
        if (used === null || available === null) return false;
        return used > available;
    })

    aggregatedFeatures = computed(() => {
        const plans = this.pricingPlans();
        const selectedPlan = this.currentPlan();

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

    currentCycle = signal<MTUCycleDates | null>(null);

    pricingPlans = signal([
        {
            key: ProductKey.Collect,
            datasources: [
                {
                    name: 'Google Analytics',
                    icon: 'images/icons/external-reports/005-google-analytics.png'
                }
            ],
            featuresListTitle: {
                plan: 'Pro',
                prefix: 'Our',
                postfix: 'plan includes:'
            },
            features: [
                { description: 'White glove service', iconName: 'hotel_class' },
                { description: 'Auto-track user actions' },
                { description: 'Dashboards' },
                { description: 'External reports' },
                { description: 'No user, session or event limits' }
            ],
            buttonText: 'Start free trial',
            trialPeriod: '14-day free trial'
        },
        {
            key: ProductKey.Optimize,
            description: 'Modern analytics, for web apps and websites',
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
                plan: 'Pro',
                prefix: 'Everything in',
                postfix: ', and:'
            },
            features: [
                { description: '1,000 MTU included' },
                { description: 'Event-level reports' },
                { description: 'User-level reports' },
                { description: 'Feature-level reports' },
                { description: 'Advanced dashboards' },
                { description: 'Monitoring & alerting' },
                { description: '24 months data retention' }
            ],
            buttonText: 'Start free trial',
            trialPeriod: '14-day free trial'
        },
        {
            key: ProductKey.Scale,
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
                plan: 'Premium B2C',
                prefix: 'Everything in',
                postfix: ', and:'
            },
            features: [
                { description: '1,000 MTU included' },
                { description: 'Company-level reports' },
                { description: 'Customer-facing dashboard' }
            ],
            buttonText: 'Start free trial',
            trialPeriod: '14-day free trial'
        }
    ]);

    async ngOnInit() {
        try {
            this.loadingData.set(true);
            await Promise.allSettled([
                this.fetchMtuUsageForCurrentCycle(),
                this.fetchSubscriptionAndPlanData()
            ]);
        } catch (err) {
            this.toastrService.error(`Failed to fetch subscriptions details. Please try again.`);
            console.error(`Error occured while fetching subscripton details: `, err);
        } finally {
            this.loadingData.set(false);
        }
    }

    cancelSubscription() {
        const dialogData = new ConfirmDialogModel(
            `Please confirm that you want cancel your current subscription`
        );

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '600px',
            data: dialogData,
            backdropClass: 'dashboard-dialog-backdrop'
        });

        dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
            if (confirmed) {
                try {
                    await this.checkoutService.createPortalSession('cancel');
                } catch {
                    this.toastrService.error(
                        'Error occuring during subscription cancelation. Please contact the administrator.'
                    );
                }
            }
        });
    }

    async fetchMtuUsageForCurrentCycle() {
        const total = await this.mtuService.fetchMTUTotalPerCurrentCycle(User.current!.orgId);

        this.mtuUsageAmount.set(total);
    }

    private async fetchSubscriptionAndPlanData(): Promise<OrgSubscription | null> {
        const subscription = await this.subscriptionService.getUserSubscription();
        const cycle = this.mtuHelperService.getCurrentMTUCycle(subscription);
        this.currentCycle.set(cycle);
        this.userSubscription.set(subscription);

        this.currentPlan.set(null);
        this.mtuAvailableCount.set(null);
        
        if (subscription) {
            if (subscription.productId) {
                try {
                    const currentPlan = await this.plansService.getPlanById(subscription.productId);
                    this.currentPlan.set(currentPlan);
                } catch (planError) {
                    this.toastrService.error(
                        `Failed to fetch plan details for productId ${subscription.productId}`
                    );
                    console.error(
                        `Failed to fetch plan details for productId ${subscription.productId}:`,
                        planError
                    );
                }
            }
            if (subscription.quantity !== undefined && subscription.quantity !== null) {
                this.mtuAvailableCount.set(subscription.quantity);
            }
        }
        return subscription;
    }
}
