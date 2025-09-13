import { animate, style, transition, trigger } from '@angular/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
    signal,
} from '@angular/core';

@Component({
    selector: 'app-ga-table-overlay',
    templateUrl: './ga-table-overlay.component.html',
    styleUrl: './ga-table-overlay.component.scss',
    standalone: true,
    imports: [OverlayModule],
    animations: [
        trigger('fadeInScale', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate(
                    '100ms linear',
                    style({ opacity: 1, transform: 'scale(1)' })
                ),
            ]),
            transition(':leave', [
                animate(
                    '25ms linear',
                    style({ opacity: 0, transform: 'scale(0.8)' })
                ),
            ]),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaTableOverlayComponent {
    isOpen = signal(false);

    closed = output<void>();
    opened = output<void>();

    triggerName = input<string>();

    disabled = input<boolean>(false);

    public close() {
        this.isOpen.set(false);
    }

    protected animationFinished() {
        if (this.isOpen()) {
            this.opened.emit();
        } else {
            this.closed.emit();
        }
    }

    protected toggle() {
        this.isOpen.update((v) => !v);
    }
}
