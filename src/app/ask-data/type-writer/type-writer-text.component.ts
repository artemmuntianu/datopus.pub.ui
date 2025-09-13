import {
    Component,
    Input,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-type-writer-text',
    standalone: true,
    imports: [CommonModule],
    template: `
        {{ displayedText }}
        @if (!isComplete()) {
            <span class="cursor" [class.blinking]="true">|</span>
        }
    `,
    styleUrls: ['./type-writer-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypewriterTextComponent implements  OnChanges, OnDestroy {
    @Input({ required: true }) fullText: string = '';
    @Input() speedMs: number = 50;
    @Input() startDelayMs: number = 0;

    @Output() animationComplete = new EventEmitter<void>();

    displayedText: string = '';
    isComplete = signal<boolean>(false);
    private currentIndex: number = 0;
    private intervalId?: number | NodeJS.Timeout;
    private timeoutId?: number | NodeJS.Timeout;

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fullText'] && !changes['fullText'].firstChange) {
            this.resetAndStartAnimation();
        } else if (changes['fullText'] && changes['fullText'].firstChange) {
            this.resetAndStartAnimation();
        }
    }

    ngOnDestroy(): void {
        this.clearTimers();
    }

    private resetAndStartAnimation(): void {
        this.clearTimers();
        this.displayedText = '';
        this.currentIndex = 0;
        this.isComplete.set(false);
        this.cdr.markForCheck();

        if (this.fullText && this.fullText.length > 0) {
            this.timeoutId = setTimeout(() => {
                this.startTyping();
            }, this.startDelayMs);
        } else {
            this.isComplete.set(true);
            this.cdr.markForCheck();
        }
    }

    private startTyping(): void {
        this.clearTimers();

        this.intervalId = setInterval(() => {
            if (this.currentIndex < this.fullText.length) {
                this.displayedText += this.fullText[this.currentIndex];
                this.currentIndex++;
                this.cdr.markForCheck();
            } else {
                this.completeAnimation();
            }
        }, this.speedMs);
    }

    private completeAnimation(): void {
        this.clearTimers();
        this.isComplete.set(true);

        this.animationComplete.emit();
        this.cdr.markForCheck();
    }

    private clearTimers(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId as number);
            this.intervalId = undefined;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId as number);
            this.timeoutId = undefined;
        }
    }
}
