import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    standalone: true,
	pure: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: any, ...args: unknown[]): string {
        if (!value) {
            return '';
        }

        let dateValue: Date;

        if (value instanceof Date) {
            dateValue = value;
        } else if (typeof value === 'string' || typeof value === 'number') {
            dateValue = new Date(value);
        } else {
            console.error('Invalid input type for TimeAgoPipe:', typeof value);
            return '';
        }

        if (isNaN(dateValue.getTime())) {
            console.error('Invalid date value for TimeAgoPipe:', value);
            return '';
        }

        const now = new Date();
        const seconds = Math.max(0, Math.floor((now.getTime() - dateValue.getTime()) / 1000));

        const intervals = [
            { label: 'year', seconds: 31536000 }, // 365 days
            { label: 'month', seconds: 2592000 }, // 30 days (approximation)
            { label: 'week', seconds: 604800 }, // 7 days
            { label: 'day', seconds: 86400 }, // 24 hours
            { label: 'hour', seconds: 3600 }, // 60 minutes
            { label: 'minute', seconds: 60 } // 60 seconds
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                const label = count === 1 ? interval.label : interval.label + 's';
                return `${count} ${label} ago`;
            }
        }

        return 'just now';
    }
}
