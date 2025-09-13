import { Injectable } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    BQMatchType,
    BQOperation,
} from '../../../../../services/google/big-query/models/bq-filter';
import {
    BQMetricDefinition,
    BQDimensionDefinition,
    BQNumericFilterDefinition,
    BQDateFilterDefinition,
    BQStringFilterDefinition,
    ReportSettings,
    ChartVisual,
    DiagramVisual,
    TableVisual,
} from '../../models/reports-definition';

export type GQFilterFormType =
    | 'string'
    | 'numeric'
    | 'between'
    | 'empty'
    | 'date';

export type ReportsDateFilterValue = {
    dateRange: any;
    key: any;
    dateDiff: any;
    label: any;
};

export type VisualForm = FormGroup<{
    selectedVisual: FormControl<
        ChartVisual | TableVisual | DiagramVisual | null
    >;
    selectedChartDrilldownDimension: FormControl<BQDimensionDefinition | null>;
    selectedChartMetric: FormControl<BQMetricDefinition | null>;
    selectedChartDimension: FormControl<BQDimensionDefinition | null>;
    selectedDiagramMetric: FormControl<BQMetricDefinition | null>;
    selectedSort: FormGroup<{
        sortField: FormControl<string | null>;
        sortDirection: FormControl<boolean | null>;
    }>;
}>;

export interface ReportsBaseFilterFormGroup {
    filterTarget: FormControl<
        BQMetricDefinition | BQDimensionDefinition | null
    >;
    formType: FormControl<GQFilterFormType>;
}

export interface ReportsDateFilterFormGroup extends ReportsBaseFilterFormGroup {
    formType: FormControl<'date'>;
    filterValue: FormControl<ReportsDateFilterValue>;
}

export interface ReportsGeneralFilterFormGroup
    extends ReportsBaseFilterFormGroup {
    filterType: FormControl<string>;
    formType: FormControl<Exclude<GQFilterFormType, 'date'>>;
    filterValue: FormControl<string>;
}

export type ReportsFilterFormGroupValue =
    | ReportsDateFilterFormGroup
    | ReportsGeneralFilterFormGroup;

export interface ReportsFilterControl {
    source?:
        | BQNumericFilterDefinition
        | BQStringFilterDefinition
        | BQDateFilterDefinition;
    label: string;
    isEditing: boolean;
    errors: string[];
    form:
        | FormGroup<ReportsDateFilterFormGroup>
        | FormGroup<ReportsGeneralFilterFormGroup>;
}
export interface ReportsFieldControl {
    source?: BQMetricDefinition | BQDimensionDefinition;
    label: string;
    icon: string;
}

@Injectable({ providedIn: 'root' })
export class ReportsControlBuilderService {
    private matchTypeLabels: Record<BQMatchType, string> = {
        [BQMatchType.CONTAINS]: 'contains',
        [BQMatchType.BEGINS_WITH]: 'begins with',
        [BQMatchType.MATCH_EXACT]: 'exactly matches',
        [BQMatchType.NOT_MATCH_EXACT]: 'does not exactly match',
        [BQMatchType.ENDS_WITH]: 'ends with',
        [BQMatchType.MATCH_REGEX]: 'matches regex',
        [BQMatchType.NOT_MATCH_REGEX]: 'does not match regex',
    };

    private numericLabels: Record<BQOperation, string> = {
        EQUAL: '=',
        GREATER_THAN: '>',
        GREATER_THAN_OR_EQUAL: '>=',
        LESS_THAN_OR_EQUAL: '<=',
        LESS_THAN: '<',
        NOT_EQUAL: '!=',
    };

    constructor(private fb: FormBuilder) {}

    buildVisualForm(settings: ReportSettings): VisualForm {
        const form = this.fb.group({
            selectedVisual: [
                settings.selectedVisual ?? null,
                Validators.required,
            ],
            selectedChartDrilldownDimension: [
                settings.selectedDrilldownDimension ?? null,
            ],
            selectedChartMetric: [
                settings.selectedChartMetric ?? null,
            ],
            selectedDiagramMetric: [
                settings.selectedDiagramMetric ?? null
            ],
            selectedChartDimension: [
                settings.selectedChartDimension ?? null,
            ],
            selectedSort: this.fb.group({
                sortField: [
                    settings.selectedSort?.fieldName ?? null,
                    Validators.required,
                ],
                sortDirection: [
                    settings.selectedSort?.desc ?? true,
                    Validators.required,
                ],
            }),
        });
    
        this.applyValidationRulesBasedOnVisualKind(form, settings.selectedVisual?.type);
        return form;
    }

    updateVisualFormValidators(form: VisualForm) {
        const selectedVisual = form.controls.selectedVisual.value;
        this.applyValidationRulesBasedOnVisualKind(form, selectedVisual?.type);
    }

    buildReportsFieldControls(
        dimensions: BQDimensionDefinition[],
        metrics: BQMetricDefinition[]
    ): ReportsFieldControl[] {
        return [
            ...dimensions.map((dimension) => ({
                icon: 'abc',
                label: dimension.uiName,
                source: dimension,
            })),
            ...metrics.map((metric) => ({
                icon: '123',
                label: metric.uiName,
                source: metric,
            })),
        ];
    }

    buildEmptyReportsFieldControl(
        source?: BQMetricDefinition | BQDimensionDefinition
    ): ReportsFieldControl {
        return {
            source,
            label: '',
            icon: '',
        };
    }

    buildEmptyReportsFilterControl(): ReportsFilterControl {
        return {
            label: '',
            isEditing: true,
            errors: [],
            form: this.buildFilterForm(),
        };
    }

    buildReportsFilterControls(
        filterList: (
            | BQNumericFilterDefinition
            | BQStringFilterDefinition
            | BQDateFilterDefinition
        )[],
        definitions: (BQDimensionDefinition | BQMetricDefinition)[]
    ): ReportsFilterControl[] {
        return filterList.map((fd) => {
            const target = this.getFilterTarget(fd, definitions);
            return {
                source: fd,
                target,
                label: this.getLabel(fd, target?.uiName ?? fd.fieldId),
                isEditing: false,
                // encapsulate errors in form?
                errors: [],
                form: this.buildFilterForm(
                    fd,
                    definitions.find((d) => d.apiName === fd.fieldId)!
                ),
            };
        });
    }

    buildFilterForm(
        filterDef?:
            | BQNumericFilterDefinition
            | BQStringFilterDefinition
            | BQDateFilterDefinition,
        target?: BQMetricDefinition | BQDimensionDefinition
    ):
        | FormGroup<ReportsDateFilterFormGroup>
        | FormGroup<ReportsGeneralFilterFormGroup> {
        if (
            filterDef?.type === 'date' ||
            (!filterDef && target?.apiName === 'event_date')
        ) {
            return this.createDateFilterForm(filterDef, target);
        } else {
            return this.createGeneralFilterForm(filterDef, target);
        }
    }

    // move out this logic?
    getMatchLables() {
        return this.matchTypeLabels;
    }

    getNumericOperationLables() {
        return this.numericLabels;
    }

    getMatchLable(matchType: BQMatchType) {
        return this.matchTypeLabels[matchType];
    }

    getNumericOperationLable(matchType: BQOperation) {
        return this.numericLabels[matchType];
    }

    getLabel(
        filterDef:
            | BQNumericFilterDefinition
            | BQStringFilterDefinition
            | BQDateFilterDefinition,
        filterTargetName: string
    ): string {
        if (filterDef.type === 'date') {
            if (filterDef.label) {
                return `${filterTargetName} - ${filterDef.label}`;
            }
            return `${filterTargetName} between ${filterDef.filter.dateRange.start.toLocaleDateString()} and ${filterDef.filter.dateRange.end.toLocaleDateString()}`;
        }

        if (filterDef.type === 'string') {
            const matchLabel = this.getMatchLable(filterDef.filter.matchType);
            return `${filterTargetName} ${matchLabel} ${filterDef.filter.value}`;
        }

        if (filterDef.type === 'numeric') {
            const numericLabel = this.getNumericOperationLable(
                filterDef.filter.operation
            );
            return `${filterTargetName} ${numericLabel} ${filterDef.filter.value}`;
        }

        return '';
    }

        
    private applyValidationRulesBasedOnVisualKind(form: VisualForm, visualKind?: 'chart' | 'table' | 'diagram') {
        form.controls.selectedChartMetric.clearValidators();
        form.controls.selectedChartDimension.clearValidators();
        form.controls.selectedDiagramMetric.clearValidators();
        form.controls.selectedSort.controls.sortDirection.clearValidators();
        form.controls.selectedSort.controls.sortField.clearValidators();

        switch (visualKind) {
            case 'chart': {
                form.controls.selectedChartMetric.setValidators(Validators.required);
                form.controls.selectedChartDimension.setValidators(Validators.required);
                form.controls.selectedSort.controls.sortDirection.setValidators(Validators.required);
                form.controls.selectedSort.controls.sortField.setValidators(Validators.required);
                break;
            }
            case 'diagram': {
                form.controls.selectedDiagramMetric.setValidators(Validators.required);
                break;
            }
            case 'table':
                form.controls.selectedSort.controls.sortDirection.setValidators(Validators.required);
                form.controls.selectedSort.controls.sortField.setValidators(Validators.required);
                break;
        }
        form.controls.selectedSort.controls.sortDirection.updateValueAndValidity();
        form.controls.selectedSort.controls.sortField.updateValueAndValidity();
        form.controls.selectedDiagramMetric.updateValueAndValidity();
        form.controls.selectedChartMetric.updateValueAndValidity();
        form.controls.selectedChartDimension.updateValueAndValidity();
    }
    

    private getFilterTarget(
        fd:
            | BQNumericFilterDefinition
            | BQStringFilterDefinition
            | BQDateFilterDefinition,
        definitions: (BQDimensionDefinition | BQMetricDefinition)[]
    ): BQMetricDefinition | BQDimensionDefinition | undefined {
        return definitions.find((m) => m.apiName === fd.fieldId);
    }

    private getFilterFormType(
        filterDef?:
            | BQNumericFilterDefinition
            | BQStringFilterDefinition
            | BQDateFilterDefinition,
        target?: BQDimensionDefinition | BQMetricDefinition
    ): GQFilterFormType {
        if (filterDef?.type === 'string') return 'string';
        if (filterDef?.type === 'numeric') return 'numeric';
        if (filterDef?.type === 'date') return 'date';
        return this.determineFilterFormTypeFromTarget(target);
    }

    private determineFilterFormTypeFromTarget(
        target?: BQDimensionDefinition | BQMetricDefinition
    ): GQFilterFormType {
        if (target?.apiName === 'event_date') return 'date';
        if (target?.type === 'dimension') return 'string';
        if (target?.type === 'metric') return 'numeric';
        return 'empty';
    }

    private createDateFilterForm(
        filterDef?: BQDateFilterDefinition,
        target?: BQMetricDefinition | BQDimensionDefinition
    ): FormGroup<ReportsDateFilterFormGroup> {
        return this.fb.group<ReportsDateFilterFormGroup>({
            filterValue: this.fb.control(
                {
                    dateRange: filterDef?.filter.dateRange,
                    key: filterDef?.key,
                    dateDiff: filterDef?.dateDiff,
                    label: filterDef?.label,
                },
                {
                    nonNullable: true,
                    validators: (control) => {
                        return control.value.dateRange
                            ? null
                            : { required: true };
                    },
                }
            ),
            filterTarget: this.fb.control(target ?? null, {
                nonNullable: true,
                validators: [Validators.required],
            }),
            formType: this.fb.control('date', {
                nonNullable: true,
                validators: [Validators.required],
            }),
        });
    }

    private createGeneralFilterForm(
        filterDef?: BQNumericFilterDefinition | BQStringFilterDefinition,
        target?: BQMetricDefinition | BQDimensionDefinition
    ): FormGroup<ReportsGeneralFilterFormGroup> {
        let filterTypeValue = '';
        let filterValue = '';

        if (filterDef?.type === 'string') {
            filterTypeValue = filterDef.filter.matchType;
            filterValue = filterDef.filter.value;
        } else if (filterDef?.type === 'numeric') {
            filterTypeValue = filterDef.filter.operation;
            filterValue = filterDef.filter.value;
        }

        return this.fb.group<ReportsGeneralFilterFormGroup>({
            filterType: this.fb.control(filterTypeValue, {
                nonNullable: true,
                validators: [Validators.required],
            }),
            filterValue: this.fb.control(filterValue, {
                nonNullable: true,
                validators: [Validators.required],
            }),
            filterTarget: this.fb.control(target ?? null, {
                nonNullable: true,
                validators: [Validators.required],
            }),
            formType: this.fb.control(
                this.getFilterFormType(filterDef, target) as Exclude<
                    GQFilterFormType,
                    'date'
                >,
                {
                    nonNullable: true,
                    validators: [Validators.required],
                }
            ),
        });
    }
}
