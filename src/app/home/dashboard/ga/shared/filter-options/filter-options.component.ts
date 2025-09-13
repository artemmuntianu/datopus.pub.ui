import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    output,
    Renderer2,
    signal,
    ViewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, timer } from 'rxjs';
import {
    filter,
    map,
    startWith,
    switchMap,
    take,
    takeUntil,
} from 'rxjs/operators';
import { AsyncPipe, NgClass } from '@angular/common';
import {
    MatAutocomplete,
    MatAutocompleteModule,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';

export enum GAFilterEventSource {
    'focusout',
    'select',
    'reset',
}

export class GAFilterChangedEvent {
    constructor(
        public value: string,
        public source: GAFilterEventSource,
        public isOptionSelected: boolean
    ) {}
}

@Component({
    selector: 'app-filter-options',
    standalone: true,
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        AsyncPipe,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NgClass,
    ],
    templateUrl: './filter-options.component.html',
    styleUrl: './filter-options.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterOptionsComponent {
    @ViewChild(MatAutocomplete) autocomplete: MatAutocomplete;

    renderer: Renderer2 = inject(Renderer2);
    options = input<string[]>([]);
    filterLabel = input<string>('');
    emptyOptionPlaceholder = input<string>('');
    filterChanged = output<GAFilterChangedEvent>();
    inputControl = new FormControl('');
    filteredOptions: Observable<string[]>;
    optionSelected = signal<boolean>(false);
    destroy$ = new Subject<void>();
    filterChangedEmitterSubject$ = new Subject<GAFilterChangedEvent>();
    private openPanellistenerFn = () => {};

    constructor() {
        this.filteredOptions = combineLatest([
            this.inputControl.valueChanges.pipe(startWith('')),
            toObservable(this.options),
        ]).pipe(
            takeUntil(this.destroy$),
            map(([value, options]) => this.filter(value || '', options))
        );
    }

    onResetClick(event: Event, complete: MatAutocompleteTrigger) {
        event.stopPropagation();
        event.preventDefault();

        this.optionSelected.set(false);

        if (complete.panelOpen) {
            complete.closePanel();
        }

        this.reset();
    }

    ngAfterViewInit() {
        this.autocomplete.opened
            .pipe(
                takeUntil(this.destroy$),
                switchMap(() =>
                    // panel is not rendered after event emitted so we need to await untill it's rendered
                    // I didn't use setTimeout, because it's not very reliable, but still we might need to find a better approach
                    timer(0, 50).pipe(
                        filter(() => !!this.autocomplete.panel?.nativeElement),
                        take(1)
                    )
                )
            )
            .subscribe(() => {
                const panelElement = this.autocomplete.panel.nativeElement;

                this.openPanellistenerFn = this.renderer.listen(
                    panelElement,
                    'pointerdown',
                    this.onPanelPointerDown
                );
            });

        this.autocomplete.closed
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openPanellistenerFn();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.openPanellistenerFn) {
            this.openPanellistenerFn();
        }
    }

    // Events within panel should not overlap with events on focusout
    onPanelPointerDown = (event: Event) => {
        event.preventDefault();
    };

    onOptionSelected() {
        this.optionSelected.set(true);
        this.emitFilterChange(GAFilterEventSource.select);
        this.inputControl.markAsUntouched();
        this.inputControl.markAsPristine();
    }

    // When we click on mat-label inside mat-form-field control,
    // mat-label is absolutely positioned and focusout event will be triggered.
    // In such case we have to manually check if the target event was outside the control or not.
    onFocusOut(event: FocusEvent) {
        const relatedTarget = event.relatedTarget as HTMLElement;
        const isStillInside =
            relatedTarget &&
            !!(
                relatedTarget.closest('.ga-filter-field') ||
                relatedTarget === event.target
            );

        if (isStillInside) return;

        if (this.inputControl.dirty) {
            this.optionSelected.set(false);
        }

        this.emitFilterChange(GAFilterEventSource.focusout);
    }

    private reset() {
        this.inputControl.reset();
        this.emitFilterChange(GAFilterEventSource.reset);
    }

    private emitFilterChange(eventSource: GAFilterEventSource) {
        this.filterChanged.emit({
            value: this.inputControl.value ?? '',
            source: eventSource,
            isOptionSelected: this.optionSelected(),
        });
    }

    private filter(value: string, options: string[]): string[] {
        const filterValue = value.toLowerCase();
        return (
            options.filter((option) =>
                option.toLowerCase().includes(filterValue)
            ) ?? []
        );
    }
}
