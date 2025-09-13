import { Pipe, PipeTransform } from '@angular/core';
import { UserSubscriptionService } from '../services/user-subscription.service';
import { PriceLookupKey } from '../../settings/subscription/api/models/price-lookup-keys';

@Pipe({
    name: 'hasSubscription',
    standalone: true,
    pure: true
})
export class SubscriptionGuardPipe implements PipeTransform {
    constructor(private userSubscriptionService: UserSubscriptionService) {}

    transform(
        userSubscription: PriceLookupKey,
        requiredSubscriptions: PriceLookupKey[],
        exact: boolean = false
    ): boolean {
        return this.userSubscriptionService.hasAccess(
            userSubscription,
            requiredSubscriptions,
            exact
        );
    }
}
