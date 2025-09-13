import { Component, OnInit, input, output } from '@angular/core';
import {
    FormGroup,
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    ValidatorFn,
} from '@angular/forms';
import { DateRange } from '../../../home/dashboard/services/dashboard-time.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Validators } from 'ngx-editor';

@Component({
    selector: 'app-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    styleUrls: ['./date-range-picker.component.scss'],
    imports: [
        MatCardModule,
        MatFormFieldModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    standalone: true,
})
export class DateRangePickerComponent implements OnInit {
    valueChange = output<DateRange>();
    defaultRange = input<DateRange>();
    minDate = input<Date>(new Date('2015-08-13'));
    maxDate = input<Date>(new Date('3000-01-01'));

    range: FormGroup;

    constructor(private fb: FormBuilder) {
        this.range = this.fb.group({
            start: ['', Validators.required],
            end: ['', Validators.required],
        });
    }

    private previousValidRange?: DateRange;

    ngOnInit() {
        const defaultRange = this.defaultRange();

        if (defaultRange) {
            this.range.setValue(defaultRange);
            this.previousValidRange = defaultRange;
        }

        this.range.setValidators(
            this.dateRangeValidator(this.minDate(), this.maxDate())
        );
    }

    private dateRangeValidator(minDate: Date, maxDate: Date): ValidatorFn {
        return (group) => {
            const start = group.get('start')?.value;
            const end = group.get('end')?.value;

            if (!start || !end) {
                return { dateRangeInvalid: true };
            }

            const startDateValid = start >= minDate && start <= maxDate;
            const endDateValid = end >= minDate && end <= maxDate;

            const rangeValid = start <= end;

            if (!startDateValid || !endDateValid) {
                return { dateOutOfRange: true };
            }

            if (!rangeValid) {
                return { dateRangeInvalidOrder: true };
            }

            return null;
        };
    }

    onRangePickerClosed() {
        if (this.isGroupValid() && this.hasValueChanged()) {
            this.valueChange.emit(this.range.value);
            this.previousValidRange = this.range.value;
        } else {
            this.range.setValue({
                start: this.previousValidRange?.start ?? null,
                end: this.previousValidRange?.end ?? null,
            });
        }
    }

    onFocusOut(event: FocusEvent) {
        const relatedTarget = event.relatedTarget as HTMLElement;

        const isStillInside =
            relatedTarget &&
            !!(
                relatedTarget.closest('.mat-end-date, .mat-start-date') ||
                relatedTarget === event.target
            );

        if (isStillInside) return;

        if (this.isGroupValid() && this.hasValueChanged()) {
            this.valueChange.emit(this.range.value);
            this.previousValidRange = this.range.value;
        } else {
            this.range.setValue({
                start: this.previousValidRange?.start ?? null,
                end: this.previousValidRange?.end ?? null,
            });
        }
    }

    isGroupValid() {
        return !this.range.invalid;
    }

    private hasValueChanged(): boolean {
        return (
            this.previousValidRange?.end.getTime() !==
                this.range.value.end.getTime() ||
            this.previousValidRange?.start.getTime() !==
                this.range.value.start.getTime()
        );
    }
}
