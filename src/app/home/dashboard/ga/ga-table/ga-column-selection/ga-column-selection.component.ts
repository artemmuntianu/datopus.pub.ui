import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewChild,
    input,
    output,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, startWith, map, combineLatest } from 'rxjs';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { GaColumnType } from '../../../../../services/google/ga-data/types/v1beta/ga-column';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface GaColumnOption {
    type: GaColumnType;
    uiName: string;
    apiName: string;
    description: string;
}
[];

export interface GaColumnGroup {
    category: string;
    options: GaColumnOption[];
}

@Component({
    styleUrl: './ga-column-selection.component.scss',
    templateUrl: './ga-column-selection.component.html',
    selector: 'app-ga-column-selection',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        AsyncPipe,
        MatCardModule,
        MatMenuModule,
        UpperCasePipe,
        MatTooltipModule,
    ],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GAColumnSelectionComponent {
    @ViewChild('input') input!: ElementRef;

    groups = input<GaColumnGroup[] | null>(null);

    optionSelected = output<GaColumnOption>();

    columnOptionControl = new FormControl<GaColumnOption | string | null>('');

    columnGroupOptions: Observable<GaColumnGroup[]>;

    constructor() {
        this.columnGroupOptions = combineLatest([
            this.columnOptionControl.valueChanges.pipe(startWith('')),
            toObservable(this.groups),
        ]).pipe(
            map(([value, groups]) => {
                if (!groups) return [];
                return typeof value === 'string'
                    ? this.filterGroup(groups, value)
                    : groups;
            })
        );
    }

    public focus() {
        this.input.nativeElement.focus();
    }

    public reset() {
        this.columnOptionControl.reset();
    }

    displayOption(option: GaColumnOption | null): string {
        return option ? option.uiName : '';
    }

    onSelection(event: MatAutocompleteSelectedEvent) {
        const selected = event.option.value as GaColumnOption;
        this.optionSelected.emit(selected);
    }

    private filterGroup(
        groups: GaColumnGroup[],
        value: string
    ): GaColumnGroup[] {
        const filterValue = value.toLowerCase();
        return groups
            .map((group) => ({
                category: group.category,
                options: this.filterOptions(group.options, filterValue),
            }))
            .filter((group) => group.options.length > 0);
    }

    private filterOptions(
        options: GaColumnOption[],
        value: string
    ): GaColumnOption[] {
        return options.filter((item) =>
            item.uiName.toLowerCase().includes(value)
        );
    }
}
