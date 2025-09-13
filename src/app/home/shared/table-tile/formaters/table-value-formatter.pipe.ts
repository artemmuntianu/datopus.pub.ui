import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import {
    TableValueFormatterSettings,
    TableValueNumberFormatterSettings,
    TableValueDateFormatterSettings,
} from './table-value-formatter-settings';

const minFractionDigits = '0';
const minIntegerDigits = '1';

@Pipe({
    name: 'tableValueFormatter',
    standalone: true,
    pure: true,
})
export class TableValueFormatter implements PipeTransform {
    constructor(
        private decimalPipe: DecimalPipe,
        private datePipe: DatePipe
    ) {}

    transform(value: string, settings?: TableValueFormatterSettings): string {
        if (!settings) return value;

        if (settings instanceof TableValueNumberFormatterSettings) {
            return this.formatNumber(value, settings);
        }

        if (settings instanceof TableValueDateFormatterSettings) {
            return this.formatDate(value, settings);
        }

        return value;
    }

    private formatNumber(value: string, settings: TableValueNumberFormatterSettings): string {
        try {
            const digitsInfo = settings.precision
                ? `${minIntegerDigits}.${minFractionDigits}-${settings.precision}`
                : undefined;

            const locale = settings.locale ?? undefined;

            const formattedValue =
                this.decimalPipe.transform(value, digitsInfo, locale) || value;

            if (settings.delimiter && settings.delimiter !== ',') {
                return formattedValue.replace(/,/g, settings.delimiter);
            }

            return formattedValue;
        } catch {
            return value;
        }
    }

    private formatDate(value: string, settings: TableValueDateFormatterSettings): string {
        try {
            const locale = settings.locale ?? undefined;
            const dateFormat = settings.dateFormat ?? 'mediumDate';

            return this.datePipe.transform(value, dateFormat, locale) || value;
        } catch {
            return value;
        }
    }
}