import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { DateRange as MaterialDateRange } from '@angular/material/datepicker';
import {
    DEFAULT_DATE_OPTION_ENUM,
    ISelectDateOption,
    SelectedDateEvent
} from 'ng-material-date-range-picker';
import { GA_MIN_DATE, GA_MAX_DATE } from '../../../services/google/consts';
import { NgDateRangePickerHelper } from '../../dashboard/ga/helpers/date-helper';
import { DateRange } from '../../../shared/types/date-range';

@Injectable({
    providedIn: 'root'
})
export class HomeTimeService {
    private selectedTime: WritableSignal<DateRange> = signal(this.defaultDateRange());
    private selectedOption = signal<ISelectDateOption | null>(null);

    getGlobalDateRangeTime() {
        return this.selectedTime.asReadonly();
    }

    getSettings() {
        return this.dateRangeSettings();
    }

    public configureDateListOptions(optionList: ISelectDateOption[]): void {
        // bug inside date picker doesnt refresh selected options correctly;
        setTimeout(() => {
            const yesterday = this.getYesterday();

            optionList.forEach(option => {
                option.isSelected =
                    option.optionKey === this.selectedOption()?.optionKey &&
                    option.optionLabel === this.selectedOption()?.optionLabel;

                if (
                    option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM &&
                    !this.selectedOption()
                ) {
                    option.isSelected = true;
                }

                option.isVisible =
                    !(
                        option.optionKey === DEFAULT_DATE_OPTION_ENUM.DATE_DIFF &&
                        option.dateDiff === 0
                    ) && option.optionKey !== DEFAULT_DATE_OPTION_ENUM.THIS_MONTH;

                if (option.isVisible) {
                    option.callBackFunction = NgDateRangePickerHelper.createDateCallback(
                        yesterday,
                        option.dateDiff,
                        option.optionKey
                    );
                }
            });
        });
    }

    public updateGlobalDateRangeTime(event: SelectedDateEvent): void {
        this.selectedOption.set(event.selectedOption);
        if (event.range?.start && event.range?.end) {
            this.selectedTime.set({ start: event.range.start, end: event.range.end });
        }
    }

    private defaultDateRange(): DateRange {
        const yesterday = this.getYesterday();
        const sevenDaysAgo = new Date(yesterday);
        sevenDaysAgo.setDate(yesterday.getDate() - 6);

        return { start: sevenDaysAgo, end: yesterday };
    }

    private dateRangeSettings = computed(() => ({
        currentRange: new MaterialDateRange(this.selectedTime().start, this.selectedTime().end),
        ...this.getMinMaxDates(),
        maxDate: this.getYesterday()
    }));

    private getMinMaxDates() {
        return { minDate: GA_MIN_DATE, maxDate: GA_MAX_DATE };
    }

    private getYesterday(): Date {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    }
}
