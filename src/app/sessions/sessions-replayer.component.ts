import { ChangeDetectionStrategy, Component, effect, inject, signal, computed } from '@angular/core';
import { SessionsListComponent } from './sessions-list/sessions-list.component';
import { RRwebPlayerComponent } from './rrweb-player/rrweb-player.component';
import { BQRRWebSessionsService } from './services/sessions.service';
import { BQDatasource } from '../services/api/models';
import { DatasourceStore } from '../store/datasource/datasource.store';
import { BQRecordedSessionMeta } from './models/bq-recorded-session';
import { HomeTimeService } from '../home/shared/services/home-time.service';
import { DateRange } from '../shared/types/date-range';
import { eventWithTime } from '@rrweb/types';
import { BreadcrumbService } from '../common/breadcrumbs/breadcrumb.service';
import { SessionsReplayerHeaderComponent } from './sessions-header/sessions-replayer-header.component';
import { ToastrService } from 'ngx-toastr';

@Component({
    standalone: true,
    templateUrl: './sessions-replayer.component.html',
    styleUrl: './sessions-replayer.component.scss',
    selector: 'app-sessions-replayer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SessionsListComponent, RRwebPlayerComponent, SessionsReplayerHeaderComponent]
})
export class SessionsReplayerComponent {

    bqRRWebSessionService = inject(BQRRWebSessionsService);
    datasourceStore = inject(DatasourceStore);
    sessionsList = signal<BQRecordedSessionMeta[]>([]);
    homeTimeService = inject(HomeTimeService);
    breadCrumbService = inject(BreadcrumbService);
    toastrService = inject(ToastrService);


    timeRange = this.homeTimeService.getGlobalDateRangeTime();
    rrWebEvents = signal<eventWithTime[] | null>(null);
    loadingRecordingsList = signal<boolean>(false);
    loadingRecordingEvents = signal<boolean>(false);
    hideInternalSessionItems = signal<boolean>(true);
    selectedRecording = signal<BQRecordedSessionMeta | null>(null);

    filteredSessionList = computed(() => {
        const shouldHide = this.hideInternalSessionItems();
    
        return this.sessionsList().filter((item) => {
            const url = item.startPage ?? '';
            const isInternal = url.startsWith('http://localhost') || url.startsWith('https://localhost');
    
            return shouldHide ? !isInternal : true;
        });
    });

    constructor() {
        effect(
            () => {
                const source = this.datasourceStore.bqDatasource();
                const timeRange = this.timeRange();

                if (source && timeRange) {
                    this.initRecordsList(source, timeRange);
                }
            },
            { allowSignalWrites: true }
        );
    }

    hideInternalTrafficChange(shouldHide: boolean) {
        this.hideInternalSessionItems.set(shouldHide);
    }

    ngOnInit() {
        this.breadCrumbService.setHeaderBreadcrumb(['Session Replay']);
        this.datasourceStore.fetchBQDatasource();
        this.datasourceStore.fetchGADatasource();
    }

    ngOnDestroy() {
        this.breadCrumbService.resetHeaderBreadcrumb();
    }

    async loadSessionEvents(sessionMeta: BQRecordedSessionMeta) {
        this.selectedRecording.set(sessionMeta);

        const gaDatasource = this.datasourceStore.gaDatasource();

        if (!gaDatasource) {
            this.toastrService.error("Could not find google analytics data source. Please check your connections or contact the administrator.")
            console.error('unable to process session replay', gaDatasource);
            return;
        }

        this.loadingRecordingEvents.set(true);

        const blobEvents = await this.bqRRWebSessionService.getRecordedSessionEventsFromBlobStorage(
            gaDatasource,
            sessionMeta.sessionId,
            {
                start: sessionMeta.start,
                end: sessionMeta.end
            }
        );

        this.loadingRecordingEvents.set(false);

        this.rrWebEvents.set([...blobEvents]);
    }

    async initRecordsList(datasource: BQDatasource, dateRange: DateRange) {
        this.loadingRecordingsList.set(true);

        const list = await this.bqRRWebSessionService.getRecordedSessionsMetaList(
            datasource,
            dateRange
        );

        this.loadingRecordingsList.set(false);
        this.sessionsList.set(list);
    }
}
