import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { ReportDefinition } from '../../reports/features/models/reports-definition';
import { ReportsDiagramComponent } from './diagram/reports-diagram.component';
import { ReportsChartComponent } from './chart/reports-chart.component';
import { ReportsTableComponent } from './table/reports-table.component';
import { BQDatasource } from '../../../services/api/models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatasourceStore } from '../../../store/datasource/datasource.store';
import { ReportsBQApiError } from './errors/bq-api-error/bq-api-error.component';

@Component({
    selector: 'app-report-visual',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatListModule,
        ReportsDiagramComponent,
        ReportsChartComponent,
        ReportsTableComponent,
        MatProgressSpinnerModule,
        ReportsBQApiError
    ],
    template: `
        @let def = definition();
        @let source = datasource();
        @let error = datasourceStore.bqError();

        @if (datasourceStore.loadingBQSource()) {
            <div class="w-100 h-100 d-flex justify-content-center align-items-center">
                <mat-progress-spinner mode="indeterminate" [diameter]="50"></mat-progress-spinner>
            </div>
        } @else if (error) {
            <app-bq-api-error [error]="error"></app-bq-api-error>
        } @else if (source) {
            @switch (def.settings.selectedVisual.type) {
                @case ('chart') {
                    <app-reports-chart [definition]="def" [datasource]="source"></app-reports-chart>
                }
                @case ('diagram') {
                    <app-reports-diagram
                        [definition]="def"
                        [datasource]="source"
                    ></app-reports-diagram>
                }
                @case ('table') {
                    <app-reports-table [definition]="def" [datasource]="source"></app-reports-table>
                }
            }
        }
    `,
    styles: ':host { display: block; min-height: 0; height: 100%}'
})
export class ReportVisualComponent {
    datasourceStore = inject(DatasourceStore);

    definition = input.required<ReportDefinition>();
    datasource = input.required<BQDatasource | null>();
}
