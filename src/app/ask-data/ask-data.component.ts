import { Component, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { AskDataApiService } from './services/api/ask-data.api.service';
import { DatasourceStore } from '../store/datasource/datasource.store';
import { AksParsedDataContext } from './services/api/models/ask-data.response';
import { ChartComponent } from '../home/shared/chart/chart.component';
import { TableTileComponent } from '../home/shared/table-tile/table-tile.component';
import { TableTileColumnInputAdapter } from '../home/shared/table-tile/adapters/table-tile-column-input-adapter.pipe';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TypewriterTextComponent } from './type-writer/type-writer-text.component';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AskDataRequest } from './services/api/models/ask-data.request';
import { HomeTimeService } from '../home/shared/services/home-time.service';
import { AskDataHeaderComponent } from "./header/ask-data-header-header.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbService } from '../common/breadcrumbs/breadcrumb.service';

type Sender = 'user' | 'bot';
interface Message {
    text: string;
    sender: Sender;
    context?: AksParsedDataContext;
}

@Component({
    standalone: true,
    templateUrl: './ask-data.component.html',
    styleUrl: './ask-data.component.scss',
    selector: 'app-ask-data',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    ChartComponent,
    TableTileComponent,
    NgScrollbarModule,
    TableTileColumnInputAdapter,
    TypewriterTextComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    AskDataHeaderComponent,
    MatTooltipModule
]
})
export class AskDataComponent {
    apiService = inject(AskDataApiService);
    homeTimeService = inject(HomeTimeService);

    toastrService = inject(ToastrService);
    dsStore = inject(DatasourceStore);
    breadCrumbService = inject(BreadcrumbService);


    bqSource = this.dsStore.bqDatasource;
    dateRange = this.homeTimeService.getGlobalDateRangeTime();
    
    loadingData = signal<boolean>(false);
    messages = signal<Message[]>([]);
    userInput = signal('');

    hasMessages = computed(() => this.messages().length > 0);

    userInputTrimmed = computed(()=> {
        return this.userInput().trim();
    })
    
    ngOnInit() {
        this.breadCrumbService.setHeaderBreadcrumb(['Ask Data']);
        this.dsStore.fetchBQDatasource();
    }
    
    ngOnDestroy() {
        this.breadCrumbService.resetHeaderBreadcrumb();
    }

    async sendMessage() {
        const text = this.userInputTrimmed();
        if (!text) return;

        const source = this.bqSource();

        if (!source?.project_id || !source.dataset_id) {
            this.toastrService.error(
                'Dataset or project id was not found. Please check your connections or contact the administrator'
            );
            return;
        }

        this.messages.update(ms => [
            ...ms,
            { text, sender: 'user' },
            { text: '__loading__', sender: 'bot' }
        ]);

        this.userInput.set('');

        try {
            this.loadingData.set(true);

            const result = await this.apiService.askData(
                new AskDataRequest(text, this.dateRange()),
                {
                    projectId: source.project_id,
                    propertyId: source.dataset_id,
                    tableId: 'events',
                    
                }
            );

            this.messages.update(ms => [
                ...ms.slice(0, -1),
                { text: `${result.explanation}`, sender: 'bot', context: result }
            ]);
        } catch (err) {
            this.messages.update(ms => [
                ...ms.slice(0, -1),
                {
                    text: `Unable to complete the task. Please try again or contact the administrator`,
                    sender: 'bot'
                }
            ]);
        } finally {
            this.loadingData.set(false);
        }
    }
}
