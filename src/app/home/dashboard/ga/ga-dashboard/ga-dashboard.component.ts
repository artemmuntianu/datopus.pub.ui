import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { Datasource, Org, User } from '../../../../services/api/models';
import { SupabaseService } from '../../../../services/supabase/supabase.service';
import { LOCAL_STORAGE_KEYS, UserMessages } from '../../../../consts';
import { GaTableComponent } from '../ga-table/ga-table.component';
import { GATableDataService } from '../services/ga-table-data.service';
import { GaMappingService } from '../services/ga-mapping.service';
import { ToastrService } from 'ngx-toastr';
import { RedirectPlaceholderComponent } from '../../../../common/redirect-placeholder/redirect-placeholder.component';
import { GAEventTrackerComponent } from '../ga-event-tracker/ga-event-tracker.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgDatePickerModule } from 'ng-material-date-range-picker';
import { HomeTimeService } from '../../../shared/services/home-time.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../../shared/components/dialogs/alert-dialog/alert-dialog.component';
import { BreadcrumbService } from '../../../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-ga-dashboard',
    styleUrl: './ga-dashboard.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        RouterModule,
        GaTableComponent,
        MatProgressSpinnerModule,
        RedirectPlaceholderComponent,
        GAEventTrackerComponent,
        NgDatePickerModule
    ],
    templateUrl: './ga-dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaDashboardComponent {
    @ViewChild('eventTracker', { static: true }) eventTrackerTemplate: TemplateRef<any>;

    protected timeService = inject(HomeTimeService);

    private readonly dialog = inject(MatDialog);
    private readonly gaTableDataService = inject(GATableDataService);
    private readonly gaMappingService = inject(GaMappingService);

    private readonly sbService = inject(SupabaseService);
    private readonly toastr = inject(ToastrService);
    private readonly breadcrumbService = inject(BreadcrumbService);

    user: User = User.current!;

    data = {
        org: <Org | null>null
    };

    datasource$ = new Subject<Datasource | null>();
    datasourceState = signal<'empty' | 'loading' | 'set'>('loading');
    isNewDatasource = signal<boolean>(false);

    gaTableDefinitions = this.gaTableDataService.getGaTableDefinitions();

    constructor() {
        this.breadcrumbService.setHeaderBreadcrumb(['Dashboards', 'Google Analytics']);
    }

    async ngOnInit() {
        const resp: any = await this.sbService.getOrg(this.user.orgId);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.org = new Org(resp.data[0]);

        if (!this.data.org!.datasource_id) {
            this.datasourceState.set('empty');
            this.datasource$.next(null);
            return;
        }

        const resp1 = await this.sbService.getDatasource(this.data.org!.datasource_id!, [
            'auth_token'
        ]);

        if (resp1.error) {
            this.datasourceState.set('empty');
            this.datasource$.next(null);
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        const datasource = new Datasource(resp1.data[0]);

        if (datasource.auth_step !== 'step4') {
            this.datasourceState.set('empty');
            this.datasource$.next(null);
            return;
        }

        if (
            this.checkIfDatasourceIsNew(datasource) &&
            localStorage.getItem(LOCAL_STORAGE_KEYS.GA_DASHBOARD_NEW_SOURCE_DISMISS_ALERT_MESSAGE) !== 'true'
        ) {
            this.showAlertDialog();
        }

        await this.gaMappingService.initializeMapping(datasource);

        this.datasourceState.set('set');
        this.datasource$.next(datasource);
    }

    private showAlertDialog() {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
                title: 'Important Information',
                message: `The data in the tables below will be available <b>tomorrow</b>!
            <br />
            In the meantime, you can explore other features of the platform and experiment with your
            existing data collected before installing Datopus.
            <br />
            Our web tracker is currently collecting user actions from <u>today</u>, so you can analyze them
            <u>tomorrow</u> in the tables below.`,
                close: 'Hide'
            },
            backdropClass: 'dashboard-dialog-backdrop'
        });

        dialogRef.afterClosed().subscribe((isChecked: boolean) => {
            localStorage.setItem(
                LOCAL_STORAGE_KEYS.GA_DASHBOARD_NEW_SOURCE_DISMISS_ALERT_MESSAGE,
                isChecked ? 'true' : 'false'
            );
        });
    }

    private checkIfDatasourceIsNew(datasource: Datasource) {
        const datasourceCreationTimeUTC = new Date(datasource.created_at);
        const currentTimeUTC = new Date();

        const nextMidnightUTC = Date.UTC(
            currentTimeUTC.getUTCFullYear(),
            currentTimeUTC.getUTCMonth(),
            currentTimeUTC.getUTCDate() + 1, // Move to the next day
            0,
            0,
            0,
            0 // Set to 00:00:00 UTC
        );

        const millisecondsUntilMidnight = nextMidnightUTC - currentTimeUTC.getTime();

        return (
            currentTimeUTC.getTime() - datasourceCreationTimeUTC.getTime() <
            millisecondsUntilMidnight
        );
    }
}
