import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BehaviorSubject, map, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { GADataService } from '../../../../services/google/ga-data/ga-data.service';
import { Datasource } from '../../../../services/api/models';
import { GaFilter, GaStringFilter } from '../../../../services/google/ga-data/models/ga-filter';
import { GaMatchType } from '../../../../services/google/ga-data/types/v1beta/ga-filter';
import { HttpRequestResult } from '../../../../services/google/google.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { GaDataRunRealtimeReportReq } from '../../../../services/google/ga-data/models/ga-run-realtime-report-req';
import { GaDataRunRealtimeReportResp } from '../../../../services/google/ga-data/models/ga-run-realtime-report-resp';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserMessages } from '../../../../consts';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    standalone: true,
    templateUrl: './ga-event-tracker.component.html',
    styleUrl: './ga-event-tracker.component.scss',
    selector: 'app-ga-event-tracker',
    imports: [AsyncPipe, NgClass, MatProgressSpinnerModule, MatTooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GAEventTrackerComponent {
    private gaDataService = inject(GADataService);
    private readonly toastr = inject(ToastrService);

    datasource = input.required<Datasource>();

    counter$ = new BehaviorSubject<number | null>(null);

    eventCounterExplanation =
        'This number represents the total count of events tracked by our script in the last 30 minutes. The value updates every minute in real time.';

    private readonly defaultIntervalTimeMs = 60_000;
    private readonly intervalIncreaseOnErrorMs = 20_000;
    private readonly errorsCounterLimit = 3;

    private errorsCounter = 0;
    private firstRun = true;

    private request = new GaDataRunRealtimeReportReq({
        // 29 is current limit
        minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0, name: 'Last 30 minutes' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: new GaFilter(
            'eventName',
            new GaStringFilter(GaMatchType.EXACT, 'feature_event')
        )
    });

    private interval$ = new BehaviorSubject<number>(this.defaultIntervalTimeMs);

    private destroyTimer$ = new Subject<void>();

    ngOnInit() {
        this.interval$
            .pipe(
                takeUntil(this.destroyTimer$),
                switchMap(interval => {
                    if (this.firstRun) {
                        this.firstRun = false;
                        return timer(0, interval);
                    }
                    return timer(interval, interval);
                }),
                switchMap(() =>
                    this.gaDataService.runRealTimeReport(this.datasource(), this.request)
                ),
                map(this.extractMetricValue.bind(this))
            )
            .subscribe(this.counter$);
    }

    ngOnDestroy() {
        this.destroyTimer$.next();
        this.destroyTimer$.complete();
    }

    private extractMetricValue(
        response: HttpRequestResult<GaDataRunRealtimeReportResp>
    ): number | null {
        if (response.error) {
            if (this.shouldShowErrorNotification) {
                this.toastr.error(UserMessages.gaTimerFetchingIssue);
            }

            if (this.shouldIncreaseIntervalTime) {
                this.interval$.next(this.interval$.value + this.intervalIncreaseOnErrorMs);
            }

            this.errorsCounter += 1;

            return null;
        }

        this.resetErrorsCounter();

        if (this.isIntervalTimeHasBeenIncreased) {
            this.resetIntervalToDefault();
        }

        const row = response.data?.rows?.[0];
        const metric = row?.metricValues?.[0];
        return metric?.value ? Number(metric.value) : 0;
    }

    private resetErrorsCounter() {
        this.errorsCounter = 0;
    }

    private resetIntervalToDefault() {
        this.interval$.next(this.defaultIntervalTimeMs);
    }

    private get isIntervalTimeHasBeenIncreased() {
        return this.interval$.value > this.defaultIntervalTimeMs;
    }

    private get shouldIncreaseIntervalTime() {
        return this.errorsCounter >= this.errorsCounterLimit;
    }

    private get shouldShowErrorNotification() {
        return this.errorsCounter === 0;
    }
}
