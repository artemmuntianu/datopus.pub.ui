import {
    Directive,
    HostListener,
    Optional,
} from '@angular/core';
import { GaTableOverlayComponent } from './ga-table-overlay.component';

@Directive({
    selector: '[overlay-item]',
    standalone: true,
})
export class GaTableOverlayItem {
    constructor(@Optional() private parentOverlay: GaTableOverlayComponent) {}

    // TODO: add parametrized event type
    @HostListener('optionSelected', ['$event'])
    onOptionSelected() {
        this.parentOverlay?.close();
    }
}
