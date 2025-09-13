import { Pipe, PipeTransform } from '@angular/core';
import { SubscriptionStatus } from '../../settings/subscription/api/models/subscription-status';

@Pipe({
    name: 'subStatus',
    pure: true,
    standalone: true
})
export class SubscriptionStatusPipe implements PipeTransform {
    transform(value?: SubscriptionStatus | null): string {
        if (value === undefined || value === null) return '';

        const mappings: Record<string, string> = {
            [SubscriptionStatus.Active]: 'Active',
            [SubscriptionStatus.Canceled]: 'Cancelled',
            [SubscriptionStatus.Incomplete]: 'Incomplete',
            [SubscriptionStatus.IncompleteExpired]: 'Incomplete Expired',
            [SubscriptionStatus.PastDue]: 'Suspended',
            [SubscriptionStatus.Paused]: 'Suspended',
            [SubscriptionStatus.Trial]: 'Active',
            [SubscriptionStatus.Unpaid]: 'Suspended',
            [SubscriptionStatus.Startup]: 'Active',
        };
        return mappings[value] || value;
    }
}
