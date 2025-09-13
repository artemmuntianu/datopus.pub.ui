import { Pipe, PipeTransform } from '@angular/core';
import { BillingPeriod } from '../../settings/subscription/api/models/billing-period';

@Pipe({
    name: 'period',
	pure: true,
	standalone: true
})
export class PeriodPipe implements PipeTransform {
    transform(value: BillingPeriod): string {
        const mappings: Record<string, string> = {
            [BillingPeriod.Monthly]: 'Monthly',
            [BillingPeriod.Yearly]: 'Annual'
        };
        return mappings[value] || value;
    }
}
