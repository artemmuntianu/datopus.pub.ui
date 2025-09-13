import { DateRange } from '@angular/material/datepicker';
import { DEFAULT_DATE_OPTION_ENUM } from 'ng-material-date-range-picker';

export class NgDateRangePickerHelper {
    static createDateCallback(
        endDate = new Date(),
        dateDiff: number,
        optionKey: DEFAULT_DATE_OPTION_ENUM
    ) {
        let startDate = new Date();
    
        // By default it creates ranges bigger by 1 day than expected.
        // For example last 7 days option:
        // if today is 17.01.2024, it creates range starting from 10.01.2024 up to 17.01.2024 which is 8 days overall.
        let dateDiffOffset = 1;

        switch (optionKey) {
            case DEFAULT_DATE_OPTION_ENUM.MONTH_TO_DATE:
                // Start from the 1st of the current month
                startDate.setDate(1);
                break;
            case DEFAULT_DATE_OPTION_ENUM.WEEK_TO_DATE:
                // Start from the beginning of the week (Sunday)
                const currentDay = startDate.getDay();
                startDate.setDate(startDate.getDate() - currentDay);
                break;
            case DEFAULT_DATE_OPTION_ENUM.YEAR_TO_DATE:
                // Start from January 1st of the current year
                startDate.setMonth(0, 1);
                break;
            case DEFAULT_DATE_OPTION_ENUM.DATE_DIFF:
                // Start based on the difference from the end date

                startDate.setDate(endDate.getDate() - Math.abs(dateDiff) + dateDiffOffset);
                break;
            case DEFAULT_DATE_OPTION_ENUM.LAST_MONTH:
                // Start from the 1st day of the previous month
                startDate = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth() - 1,
                    1
                );

                // End on the last day of the previous month
                endDate = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    0
                ); // 0th day of the current month is the last day of the previous month
                break;
            case DEFAULT_DATE_OPTION_ENUM.THIS_MONTH:
                startDate = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    1
                );
                endDate = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth() + 1,
                    0
                );
                break;
            default:
                return () => new DateRange<Date>(new Date(), new Date());
        }

        return () => {
            return new DateRange<Date>(startDate, endDate);
        };
    }
}
