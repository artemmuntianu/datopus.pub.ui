import { ChangeDetectionStrategy, Component, ElementRef, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-enlarge-button',
    template: `
        @if (shouldShow) {
            <button mat-icon-button (click)="toggleWidth()">
                @if (width === '100%') {
                    <mat-icon>fullscreen_exit</mat-icon>
                } @else {
                    <mat-icon>fullscreen</mat-icon>
                }
            </button>
        }
    `,
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnlargeButtonComponent {

    public width?: string;
    public shouldShow: boolean;

    private containerElem: HTMLElement;

    constructor(private el: ElementRef, private renderer: Renderer2) {
    }

    ngOnInit() {
        this.containerElem = this.el.nativeElement.closest('app-ga-table').parentElement;
        if (!this.containerElem)
            return;
        this.shouldShow = !this.containerElem.classList.contains('col-12');
    }

    public toggleWidth() {
        this.width = this.containerElem.style.width != '100%' ? '100%' : '';
        this.renderer.setStyle(this.containerElem, 'width', this.width);
    }

}