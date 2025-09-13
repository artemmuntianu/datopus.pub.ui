import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { UserMessages } from '../../../../consts';
import { Org } from '../../../../services/api/models/org';
import { User } from '../../../../services/api/models/user';
import { SupabaseService } from '../../../../services/supabase/supabase.service';
import {
    BQDatasource,
    Datasource,
    DatasourceTable
} from '../../../../services/api/models/datasource';
import { ToastrService } from 'ngx-toastr';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ConnectionItemComponent } from '../item/connection-item.component';
import { SubscriptionType } from '../../../../enums';
import { TrackerCodeSnippetComponent } from '../tracker-code-snippet/tracker-code-snippet.component';
import { UserSubscriptionService } from '../../../../shared/services/user-subscription.service';
import { ProductKey } from '../../../subscription/api/models/product-key';
import { PriceLookupKey } from '../../../subscription/api/models/price-lookup-keys';

@Component({
    selector: 'app-connection-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        ConnectionItemComponent,
        TrackerCodeSnippetComponent
    ],
    templateUrl: './connection-list.component.html',
    styleUrls: ['./connection-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionListComponent {
    private userSubscriptionService = inject(UserSubscriptionService);


    user = User.current!;
    data = signal<{ org: Org | null }>({ org: null });

    DatasourceTable = DatasourceTable;
    SubscriptionType = SubscriptionType;

    constructor(
        private sbService: SupabaseService,
        private toastr: ToastrService
    ) {}

    async ngOnInit() {
        const resp = await this.sbService.getOrg(this.user.orgId, [
            'datasource',
            'big_query_datasource'
        ]);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.set({ org: <any>resp.data[0] });
    }

    hasNoDatasource = computed(() => {
        const org = this.data().org;
        return !org?.datasource_id && !org?.big_query_datasource_id;
    });

    shouldShowNewConnection = computed(() => this.canAddBigQuery() || this.canAddGoogleAnalytics());

    canAddGoogleAnalytics = computed(() => {
        return !this.data().org?.datasource_id;
    });

    canAddBigQuery = computed(() => {
        return (
            !this.data().org?.big_query_datasource_id &&
            this.userSubscriptionService.hasAccess(this.user.orgSubscription, [PriceLookupKey.OptimizeMonthly])
        );
    });

    async onDisconnectClick(datasourceId: number) {
        if (!confirm('Do you confirm deletion of the datasource?')) return;

        const resp = await this.sbService.deleteDatasource(
            datasourceId,
            DatasourceTable.GoogleAnalytics
        );
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.update(state => {
            return {
                ...state,
                org: {
                    ...(state.org as any),
                    datasource_id: null,
                    datasource: undefined
                }
            };
        });
    }

    async onBQDisconnectClick(datasourceId: number) {
        if (!confirm('Do you confirm deletion of the datasource?')) return;

        const resp = await this.sbService.deleteDatasource(datasourceId, DatasourceTable.BigQuery);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.update(state => {
            return {
                ...state,
                org: {
                    ...(state.org as any),
                    big_query_datasource_id: null,
                    big_query_datasource: undefined
                }
            };
        });
    }

    getDatasourceProperties(ds: Datasource): { key: string; value: string }[] {
        return [
            ds.ga_property_id?.length ? { key: 'Property', value: ds.ga_property_id } : null,
            ds.ga_measurement_id?.length
                ? { key: 'Measurement', value: ds.ga_measurement_id }
                : null,
            ds.unique_id?.length ? { key: 'Identifier', value: ds.unique_id } : null
        ].filter((p): p is { key: string; value: string } => p !== null);
    }

    getBQDatasourceProperties(ds: BQDatasource): { key: string; value: string }[] {
        return [
            ds.project_id?.length ? { key: 'Project', value: ds.project_id } : null,
            ds.dataset_id?.length ? { key: 'Dataset', value: ds.dataset_id } : null
        ].filter((p): p is { key: string; value: string } => p !== null);
    }
}
