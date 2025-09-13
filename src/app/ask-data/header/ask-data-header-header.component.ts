import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeTimePickerComponent } from '../../home/shared/time-picker/home-time-picker.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-ask-data-header',
    standalone: true,
    imports: [HomeTimePickerComponent, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            class="d-flex align-items-center justify-content-between position-relative g-5 p-10 bg-white border-radius"
        >
            <app-home-time-picker />
        </div>
    `
})
export class AskDataHeaderComponent {}
