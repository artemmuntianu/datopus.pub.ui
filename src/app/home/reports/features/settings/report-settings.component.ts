import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    Injector,
    input,
    output,
    runInInjectionContext,
    signal,
    untracked
} from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgDatePickerModule, SelectedDateEvent } from 'ng-material-date-range-picker';
import { combineLatest, startWith, Subscription } from 'rxjs';
import {
    BQDateFilter,
    BQMatchType,
    BQNumericFilter,
    BQOperation,
    BQStringFilter
} from '../../../../services/google/big-query/models/bq-filter';
import { HomeTimeService } from '../../../shared/services/home-time.service';
import {
    BQDateFilterDefinition,
    BQDimensionDefinition,
    BQFilterDefinition,
    BQMetricDefinition,
    BQNumericFilterDefinition,
    BQStringFilterDefinition,
    ChartVisual,
    DiagramVisual,
    ReportDefinition,
    ReportSettings,
    TableVisual,
    VisualDefinition,
    Visuals
} from '../models/reports-definition';
import {
    ReportsControlBuilderService,
    ReportsDateFilterFormGroup,
    ReportsDateFilterValue,
    ReportsFieldControl,
    ReportsFilterControl,
    VisualForm
} from './control-builder/reports-settings-control-builder.service';

@Component({
    selector: 'app-report-settings',
    templateUrl: './report-settings.component.html',
    styleUrl: './report-settings.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        MatSelectModule,
        MatExpansionModule,
        MatIcon,
        FormsModule,
        MatDividerModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        NgDatePickerModule,
        MatTooltipModule,
        MatPrefix
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSettingsComponent {
    readonly MIN_FIELDS = 2;

    private readonly controlBuilder = inject(ReportsControlBuilderService);
    private readonly injector = inject(Injector);
    public readonly timeService = inject(HomeTimeService);

    filterMatchType = BQMatchType;
    filterOperation = BQOperation;
    filterMatchTypeKeys = Object.keys(this.filterMatchType) as Array<keyof typeof BQMatchType>;
    filterOperationKeys = Object.keys(this.filterOperation) as Array<keyof typeof BQOperation>;
    visualForm: VisualForm;
    matchLabels = this.controlBuilder.getMatchLables();
    operationLabels = this.controlBuilder.getNumericOperationLables();

    settingsApplied = output<ReportSettings>();
    private subscriptions: Subscription[] = [];
    definition = input.required<ReportDefinition>();
    metricDefinitions = input<BQMetricDefinition[]>([]);
    dimensionDefinitions = input<BQDimensionDefinition[]>([]);
    visuals = input<Visuals | null>(null);

    sortValueObserver = signal<
        Partial<{ sortField: string | null; sortDirection: boolean | null }> | undefined
    >(undefined);
    chartFieldsObserver = signal<{
        dimension: BQDimensionDefinition | null;
        drilldown: BQDimensionDefinition | null;
        metric: BQMetricDefinition | null;
    }>({ dimension: null, drilldown: null, metric: null });
    visualObserver = signal<ChartVisual | TableVisual | DiagramVisual | null>(null);

    selectedSortReportsFieldControl = computed(() => {
        return this.reportsFieldControls().find(
            c => c.source?.apiName === this.sortValueObserver()?.sortField
        );
    });

    chartDimensionOptions = computed(() => {
        return this.reportsFieldControls()
            .filter(c => c.source?.type === 'dimension')
            .map(c => c.source);
    });

    metricOptions = computed(() => {
        return this.reportsFieldControls()
            .filter(c => c.source?.type === 'metric')
            .map(c => c.source);
    });

    reportsFieldControls = signal<
        {
            source?: BQMetricDefinition | BQDimensionDefinition;
            label: string;
            icon: string;
        }[]
    >([]);

    reportsFilterControls = signal<ReportsFilterControl[]>([]);

    fieldsControlIdsSet = computed(() => {
        const controls = this.reportsFieldControls();

        return new Set(controls.map(f => f.source?.apiName ?? ''));
    });

    filtersControlIdsSet = computed(() => {
        const controls = this.reportsFilterControls();

        return new Set(controls.map(f => f.source?.fieldId ?? ''));
    });

    addableReportsFieldControls = computed(() => {
        const usedIds = this.fieldsControlIdsSet();

        return this.controlBuilder.buildReportsFieldControls(
            untracked(this.dimensionDefinitions).filter(dm => !usedIds.has(dm.apiName)),
            untracked(this.metricDefinitions).filter(dm => !usedIds.has(dm.apiName))
        );
    });

    applicableSortFieldIds = computed(() => {
        const chartFields = this.chartFieldsObserver();
        const fieldControls = this.fieldsControlIdsSet();

        if (this.visualObserver()?.type === 'chart') {
            return new Set([
                chartFields?.dimension?.apiName,
                chartFields?.drilldown?.apiName,
                chartFields?.metric?.apiName
            ]);
        } else {
            return fieldControls;
        }
    });

    sortOptions = computed(() => {
        const applicableIds = this.applicableSortFieldIds();
        return untracked(this.reportsFieldControls).filter(c =>
            applicableIds.has(c.source?.apiName ?? '')
        );
    });

    fieldDefinitions = computed(() => {
        return [...this.dimensionDefinitions(), ...this.metricDefinitions()];
    });

    isFieldRemovalDisabed = computed(() => {
        return this.reportsFieldControls().length <= this.MIN_FIELDS;
    });

    visualKinds = computed<(keyof Visuals)[]>(() => {
        return Object.keys(this.visuals() ?? {}) as (keyof Visuals)[];
    });

    isAddingNewFieldDisabled = computed(() => {
        const reportsFieldControlsLength = this.reportsFieldControls().length;
        const addableControlsLength = this.addableReportsFieldControls().length;
        const metricDefinitionsLength = this.metricDefinitions().length;
        const dimensionDefinitionsLength = this.dimensionDefinitions().length;

        return (
            addableControlsLength === 0 ||
            reportsFieldControlsLength >= metricDefinitionsLength + dimensionDefinitionsLength
        );
    });

    isAddingNewFilterDisabled = computed(() => {
        const reportsFieldControlsLength = this.reportsFieldControls().length;
        const reportsFilterControlsLength = this.reportsFilterControls().length;

        return reportsFilterControlsLength >= reportsFieldControlsLength;
    });

    ngOnInit() {
        this.initializeEffect();
    }

    getAddableFilterTargets(fControl: ReportsFilterControl) {
        const fieldControls = untracked(this.reportsFieldControls);
        const filtersSet = untracked(this.filtersControlIdsSet);

        return fieldControls.filter(f => {
            return (
                f.source?.apiName === fControl.source?.fieldId ||
                !filtersSet.has(f.source?.apiName ?? '')
            );
        });
    }

    updateReportsFieldControlValue(
        event: MatSelectChange,
        ReportsFieldControl: ReportsFieldControl
    ) {
        const newControl = event.value as ReportsFieldControl;
        this.reportsFieldControls.update(controls => {
            return controls.map(c => (c === ReportsFieldControl ? newControl : c));
        });
    }

    addNewField() {
        this.reportsFieldControls.update(controls => [
            ...controls,
            this.controlBuilder.buildEmptyReportsFieldControl()
        ]);
    }

    addNewFilter() {
        this.reportsFilterControls.update(controls => [
            ...controls,
            this.controlBuilder.buildEmptyReportsFilterControl()
        ]);
    }

    updateFilterDateRangeValue(
        event: SelectedDateEvent,
        fControlForm: FormGroup<ReportsDateFilterFormGroup>
    ) {
        const {
            optionKey: key,
            dateDiff: dateDiff,
            optionLabel: label
        } = event.selectedOption ?? {};

        fControlForm.controls.filterValue.setValue({
            dateRange: event.range,
            key,
            dateDiff,
            label
        });
    }

    updateFilterTarget(fControl: ReportsFilterControl) {
        if (this.isFilterTargetUnchanged(fControl)) {
            fControl.form = this.controlBuilder.buildFilterForm(
                fControl.source,
                fControl.form.controls.filterTarget.value!
            );
        } else {
            fControl.form = this.controlBuilder.buildFilterForm(
                undefined,
                fControl.form.controls.filterTarget.value!
            );
        }
    }

    startFilterEditing(filter: ReportsFilterControl) {
        filter.isEditing = true;
    }

    cancelFilterEditing(filter: ReportsFilterControl) {
        // TODO: refactor
        // if filter is from configuration - reset, else - ignore
        // use form state to setup errors;
        if (!filter.source?.fieldId || !filter.source?.filter) {
            if (!filter.errors.length) {
                filter.errors.push('Please, complete setup or delete');
            }
        } else {
            filter.form = this.controlBuilder.buildFilterForm(
                filter.source,
                this.fieldDefinitions().find(d => d.apiName === filter.source?.fieldId)
            );
            this.validateReportsFilterControl(filter);
        }
        filter.isEditing = false;
    }

    applyChanges() {
        const reportsFilterControls = this.reportsFilterControls();

        if (
            this.visualForm.invalid ||
            reportsFilterControls.some(c => c.form.invalid || c.isEditing || c.errors.length)
        ) {
            return;
        }

        this.reportsFieldControls.update(controls => controls.filter(c => !!c.source));

        const {
            selectedChartDrilldownDimension,
            selectedChartMetric,
            selectedDiagramMetric,
            selectedChartDimension,
            selectedSort,
            selectedVisual
        } = this.visualForm.controls;

        let dimensionFilter = this.definition()?.settings.dimensionFilter;
        let metricFilter = this.definition()?.settings.metricFilter;

        const metricFilterControls = this.reportsFilterControls().filter(
            c => c.form.value.filterTarget?.type === 'metric'
        );
        const dimensionFilterControls = this.reportsFilterControls().filter(
            c => c.form.value.filterTarget?.type === 'dimension'
        );

        if (metricFilterControls.length) {
            if (!metricFilter) {
                metricFilter = new BQFilterDefinition('metric', []);
            }
            metricFilter.filterList = metricFilterControls.map(
                c => c.source as BQNumericFilterDefinition
            );
        } else {
            metricFilter = undefined;
        }

        if (dimensionFilterControls.length) {
            if (!dimensionFilter) {
                dimensionFilter = new BQFilterDefinition('dimension', []);
            }
            dimensionFilter.filterList = dimensionFilterControls.map(
                c => c.source as BQStringFilterDefinition | BQDateFilterDefinition
            );
        } else {
            dimensionFilter = undefined;
        }

        this.settingsApplied.emit({
            selectedChartDimension: selectedChartDimension.value!,
            selectedChartMetric: selectedChartMetric.value!,
            selectedVisual: selectedVisual.value!,
            selectedDiagramMetric: selectedDiagramMetric.value!,
            selectedDrilldownDimension: selectedChartDrilldownDimension.value!,
            selectedDimensions: this.reportsFieldControls()
                .map(c => c.source)
                .filter((s): s is BQDimensionDefinition => s?.type === 'dimension'),

            selectedMetrics: this.reportsFieldControls()
                .map(c => c.source)
                .filter((s): s is BQMetricDefinition => s?.type === 'metric'),
            dimensionFilter,
            metricFilter,
            selectedSort: {
                fieldName: selectedSort.controls.sortField.value!,
                desc: selectedSort.controls.sortDirection.value!
            },
            diagramDefinitions: this.definition().settings.diagramDefinitions
        });
    }

    saveFilter(fControl: ReportsFilterControl) {
        if (!fControl.form || fControl.form.invalid) return;
        const target = this.reportsFieldControls().find(
            c => c.source?.apiName === fControl.form!.value.filterTarget?.apiName
        )!;
        if (!target) return;

        const { filterTarget, formType, filterValue } = fControl.form.value;

        let source:
            | BQDateFilterDefinition
            | BQNumericFilterDefinition
            | BQStringFilterDefinition
            | null;

        switch (formType) {
            case 'date': {
                const { key, label, dateRange, dateDiff } = filterValue as ReportsDateFilterValue;
                source = new BQDateFilterDefinition(
                    filterTarget!.apiName,
                    !!target.source?.custom,
                    new BQDateFilter(dateRange),
                    key,
                    label,
                    dateDiff
                );
                break;
            }
            case 'numeric': {
                source = new BQNumericFilterDefinition(
                    filterTarget!.apiName,
                    !!target.source?.custom,
                    new BQNumericFilter(
                        fControl.form.value.filterType as BQOperation,
                        filterValue as string
                    )
                );
                break;
            }
            case 'string': {
                source = new BQStringFilterDefinition(
                    filterTarget!.apiName,
                    !!target.source?.custom,
                    new BQStringFilter(
                        fControl.form.value.filterType as BQMatchType,
                        filterValue as string
                    )
                );
                break;
            }
            default: {
                source = null;
            }
        }

        if (source) {
            this.reportsFilterControls.update(controls =>
                controls.map(c =>
                    c === fControl
                        ? this.controlBuilder.buildReportsFilterControls(
                              [source],
                              [target.source!]
                          )[0]
                        : c
                )
            );
        }
    }

    removeReportsFieldControl(ReportsFieldControl: any) {
        this.reportsFieldControls.update(controls => {
            return controls.filter(control => control !== ReportsFieldControl);
        });
    }

    removeReportsFilterControl(fControl: ReportsFilterControl) {
        this.reportsFilterControls.update(controls => {
            return controls.filter(control => control !== fControl);
        });
    }

    compareDefinitions(
        option1: BQDimensionDefinition | BQMetricDefinition,
        option2: BQDimensionDefinition | BQMetricDefinition
    ): boolean {
        return option1 && option2 ? option1.apiName === option2.apiName : option1 === option2;
    }

    compareVisuals(option1: VisualDefinition, option2: VisualDefinition): boolean {
        return option1 && option2
            ? option1.type === option2.type && option1.subtype === option2.subtype
            : option1 === option2;
    }

    private initializeFormControls(): void {
        const definition = this.definition();

        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];

        this.visualForm = this.controlBuilder.buildVisualForm(definition.settings);
        this.reportsFieldControls.set(
            this.controlBuilder.buildReportsFieldControls(
                definition.settings.selectedDimensions ?? [],
                definition.settings.selectedMetrics ?? []
            )
        );

        const filterControls = [
            ...this.controlBuilder.buildReportsFilterControls(
                definition.settings.dimensionFilter?.filterList ?? [],
                this.dimensionDefinitions()
            ),
            ...this.controlBuilder.buildReportsFilterControls(
                definition.settings.metricFilter?.filterList ?? [],
                this.metricDefinitions()
            )
        ];

        this.reportsFilterControls.set(filterControls);

        this.initializeObservers();
    }

    private initializeObservers(): void {
        this.subscriptions.push(
            this.visualForm.controls.selectedVisual.valueChanges.subscribe(value => {
                this.visualObserver.set(value);
            })
        );

        this.subscriptions.push(
            this.visualForm.controls.selectedSort.valueChanges.subscribe(value => {
                this.sortValueObserver.set(value);
            })
        );

        this.subscriptions.push(
            combineLatest({
                dimension: this.visualForm.controls.selectedChartDimension.valueChanges.pipe(
                    startWith(this.visualForm.controls.selectedChartDimension.value)
                ),
                drilldown:
                    this.visualForm.controls.selectedChartDrilldownDimension.valueChanges.pipe(
                        startWith(this.visualForm.controls.selectedChartDrilldownDimension.value)
                    ),
                metric: this.visualForm.controls.selectedChartMetric.valueChanges.pipe(
                    startWith(this.visualForm.controls.selectedChartMetric.value)
                )
            }).subscribe(values => {
                this.chartFieldsObserver.set(values);
            })
        );
    }

    private initializeEffect(): void {
        runInInjectionContext(this.injector, () => {
            effect(
                () => {
                    this.initializeFormControls();
                },
                { allowSignalWrites: true }
            );

            effect(() => {
                this.visualObserver();
                this.controlBuilder.updateVisualFormValidators(this.visualForm);
            });

            effect(() => {
                const visibleFieldsIdSet = this.fieldsControlIdsSet();
                const applicableSortFieldIdsSet = this.applicableSortFieldIds();
                this.validateVisualTab(visibleFieldsIdSet, applicableSortFieldIdsSet);
                this.validateReportsFilterControls(
                    visibleFieldsIdSet,
                    untracked(this.reportsFilterControls)
                );
            });
        });
    }

    private validateVisualTab(
        visibleFieldsIdSet: Set<string>,
        applicableSortFieldIdsSet: Set<string | undefined>
    ) {
        const updates = {
            selectedDiagramMetric: !visibleFieldsIdSet.has(
                this.visualForm.controls.selectedDiagramMetric.value?.apiName ?? ''
            )
                ? null
                : this.visualForm.controls.selectedDiagramMetric.value,
            selectedChartDrilldownDimension: !visibleFieldsIdSet.has(
                this.visualForm.controls.selectedChartDrilldownDimension.value?.apiName ?? ''
            )
                ? null
                : this.visualForm.controls.selectedChartDrilldownDimension.value,
            selectedChartMetric: !visibleFieldsIdSet.has(
                this.visualForm.controls.selectedChartMetric.value?.apiName ?? ''
            )
                ? null
                : this.visualForm.controls.selectedChartMetric.value,
            selectedChartDimension: !visibleFieldsIdSet.has(
                this.visualForm.controls.selectedChartDimension.value?.apiName ?? ''
            )
                ? null
                : this.visualForm.controls.selectedChartDimension.value,
            selectedSort: this.validateSortControl(visibleFieldsIdSet, applicableSortFieldIdsSet)
        };

        this.visualForm.patchValue(updates, {
            emitEvent: false,
            onlySelf: true
        });

        Object.keys(updates).forEach(key => {
            const control = this.visualForm.get(key);
            if (control) {
                this.markControlsAsTouched(control);
            }
        });

        this.visualForm.updateValueAndValidity();
    }

    private markControlsAsTouched(control: AbstractControl): void {
        if (control instanceof FormGroup) {
            Object.keys(control.controls).forEach(key => {
                this.markControlsAsTouched(control.get(key)!);
            });
        } else if (control instanceof FormControl) {
            control.markAsTouched();
        }
    }

    private validateSortControl(
        visibleFieldsIdSet: Set<string>,
        applicableSortFieldIdsSet: Set<string | undefined>
    ) {
        if (this.visualForm.controls.selectedVisual.value?.type === 'chart') {
            return !applicableSortFieldIdsSet.has(
                this.visualForm.controls.selectedSort.controls.sortField.value ?? ''
            ) ||
                !visibleFieldsIdSet.has(
                    this.visualForm.controls.selectedSort.controls.sortField.value ?? ''
                )
                ? { sortDirection: null, sortField: null }
                : this.visualForm.controls.selectedSort.value;
        } else {
            return !visibleFieldsIdSet.has(
                this.visualForm.controls.selectedSort.controls.sortField.value ?? ''
            )
                ? { sortDirection: null, sortField: null }
                : this.visualForm.controls.selectedSort.value;
        }
    }

    private validateReportsFilterControl(fControl: ReportsFilterControl) {
        if (!this.fieldsControlIdsSet().has(fControl.source?.fieldId ?? '')) {
            fControl.form.controls.filterTarget.setValue(null);
            fControl.form.controls.filterTarget.markAsTouched();
            if (!fControl.errors.length) {
                fControl.errors.push('Please, complete setup or delete');
            }
        }
    }

    private validateReportsFilterControls(
        visibleFieldsIdSet: Set<string>,
        fControls: ReportsFilterControl[]
    ) {
        fControls.forEach(f => {
            if (!visibleFieldsIdSet.has(f.form.controls.filterTarget.value?.apiName ?? '')) {
                f.form.controls.filterTarget.setValue(null);
                f.form.controls.filterTarget.markAsTouched();
                f.form.updateValueAndValidity();
                if (!f.errors.length) {
                    f.errors.push('Please, complete setup or delete');
                }
            }
        });
    }

    private isFilterTargetUnchanged(fControl: ReportsFilterControl): boolean {
        return fControl.source?.fieldId === fControl.form.controls.filterTarget.value?.apiName;
    }
}
