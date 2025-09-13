import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { HomeTimePickerComponent } from '../../home/shared/time-picker/home-time-picker.component';
import { FormControl, NgModel, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-sessions-replayer-header',
    standalone: true,
    imports: [HomeTimePickerComponent, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './sessions-replayer-header.component.scss',
    template: `
        <div
            class="d-flex align-items-center justify-content-between position-relative g-5 p-10 bg-white border-radius"
        >
            <app-home-time-picker />

            <div class="d-flex align-items-center">
                <label class="internal-traffic-filter-switch" for="internalTrafficSwitch">
                    Hide internal traffic
                </label>
                <input
                    id="internalTrafficSwitch"
                    type="checkbox"
                    class="internal-traffic-filter-switch"
                    [formControl]="hideInternalTrafficControl"
                />
            </div>
        </div>
    `
})
export class SessionsReplayerHeaderComponent {
    hideInternalTrafficChange = output<boolean>();

    hideInternalTrafficControl = new FormControl(true);
    private readonly LOCAL_STORAGE_KEY = 'session_replay_hideInternalTraffic';

    constructor() {
        this.hideInternalTrafficControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(value));
            this.hideInternalTrafficChange.emit(value ?? true);
        });
    }

    ngOnInit(): void {
        const storedValue = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        const initialValue = storedValue !== null ? storedValue === 'true' : true;
        this.hideInternalTrafficControl.setValue(initialValue, { emitEvent: false });
        this.hideInternalTrafficChange.emit(initialValue);
    }
}
