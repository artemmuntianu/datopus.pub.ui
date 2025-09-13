import { Component, inject } from '@angular/core';
import { HomeTimeService } from '../services/home-time.service';
import { NgDatePickerModule } from 'ng-material-date-range-picker';

@Component({
    standalone: true,
    selector: 'app-home-time-picker',
    template: `
        @let settings = timeService.getSettings();

        <ng-date-range-picker
            (click)="$event.preventDefault()"
            class="d-block"
            style="width: 260px"
            (onDateSelectionChanged)="timeService.updateGlobalDateRangeTime($event)"
            [selectedDates]="settings.currentRange"
            (dateListOptions)="timeService.configureDateListOptions($event)"
            [minDate]="settings.minDate"
            [maxDate]="settings.maxDate"
        ></ng-date-range-picker>
    `,
    imports: [NgDatePickerModule]
})
export class HomeTimePickerComponent {
    public timeService = inject(HomeTimeService);
}
