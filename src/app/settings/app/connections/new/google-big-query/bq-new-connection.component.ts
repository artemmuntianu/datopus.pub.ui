import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMessages } from '../../../../../consts';
import { ConnectionsService } from '../../../../../services/api/connections.service';
import { User, Org, Authtoken, DatasourceTable } from '../../../../../services/api/models';
import { GoogleAuthService } from '../../../../../services/google/google-auth.service';
import { SupabaseService } from '../../../../../services/supabase/supabase.service';
import { BQAdminService } from '../../../../../services/google/big-query/bq-admin/bq-admin.service';
import { BQDataset } from '../../../../../services/google/big-query/models/bq-dataset';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GettingStartedService } from '../../../../../getting-started/getting-started.service';

@Component({
    selector: 'app-bq-new-connection',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './bq-new-connection.component.html',
    styleUrl: './bq-new-connection.component.scss'
})
export class BQNewConnectionComponent {
    @ViewChild(MatStepper) stepper: MatStepper;

    private gettingStartedService = inject(GettingStartedService);

    loadingProjects = signal(false);
    selectedOrgName: string;
    selectedBQDataset: BQDataset;
    curStep: number;
    user = User.current!;

    data = {
        org: <Org>{},
        datasets: <BQDataset[]>[]
    };

    requiredGoogleScopes = ['https://www.googleapis.com/auth/bigquery.readonly'];

    constructor(
        private sbService: SupabaseService,
        private googleAuthService: GoogleAuthService,
        private googleAdminService: BQAdminService,
        private connectionsService: ConnectionsService,
        private toastr: ToastrService
    ) {
        // empty
    }

    async ngOnInit() {
        const resp = await this.sbService.getOrg(this.user.orgId, [
            'big_query_datasource',
            'auth_token'
        ]);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            this.init('step1');
            return;
        }
        this.data.org = <any>resp.data[0];

        const urlParams = new URLSearchParams(document.location.search);
        if (urlParams.has('code') && urlParams.has('scope')) {
            //verifying granted scopes
            const grantedGoogleScopes = urlParams.get('scope')!.split(' ');
            for (let reqScope of this.requiredGoogleScopes)
                if (!grantedGoogleScopes.includes(reqScope)) {
                    this.toastr.error(
                        'Please try again and ensure all requested permissions are granted.'
                    );
                    this.init('step1');
                    return;
                }

            //exchanging code for auth data
            const resp = await this.googleAuthService.exchangeAuthCodeForAccessToken(
                urlParams.get('code')!,
                '/settings/app/connections/new-bq'
            );
            if (resp.error) {
                this.toastr.error(
                    "We've got an error on requesting an access token from Google. Please try again."
                );
                this.init('step1');
                return;
            }
            //saving obtained auth data
            const dbResp = await this.connectionsService.addAuthToken(
                this.data.org.big_query_datasource_id!,
                DatasourceTable.BigQuery,
                { auth_step: 'step2' },
                resp.data!
            );
            if (!(dbResp instanceof Authtoken)) {
                this.toastr.error(UserMessages.technicalIssue);
                this.init('step1');
                return;
            }
            //refreshing page and goto Step 2
            document.location.search = '';
        } else if (urlParams.has('error')) {
            this.toastr.error(
                "We've got an error on requesting an authorization code from Google. Please try again."
            );
            this.init('step1');
        } else {
            const step = this.data.org.big_query_datasource
                ? this.data.org.big_query_datasource.auth_step
                : 'step1';
            this.init(step);
        }
    }

    init(step: string) {
        switch (step) {
            case 'step1':
                this.selectStepperStep(1);
                this.selectedOrgName = this.data.org.name;
                break;
            case 'step2':
                this.selectStepperStep(2);
                this.step2_obtainBQProjects();
                break;
            case 'step3':
                this.selectStepperStep(3);
                this.gettingStartedService.completeStep('connect-bigquery');
                break;
        }
    }

    selectStepperStep(step: number) {
        for (let i = 0; i < step; i++) this.stepper.selectedIndex = i;
        this.curStep = step;
    }

    refreshPage() {
        window.location.reload();
    }

    selectAnotherAccount() {
        this.googleAuthService.signIn(
            this.requiredGoogleScopes,
            '/settings/app/connections/new-bq'
        );
    }

    async step1_Authorize() {
        if (!this.data.org.big_query_datasource_id) {
            const apiError = await this.connectionsService.addDatasource(
                DatasourceTable.BigQuery,
                this.data.org.id
            );
            if (apiError) {
                if (apiError.message.includes('duplicate key value'))
                    this.toastr.error(
                        'Biq Query Connection for your organization already exists. Please refresh page.'
                    );
                else this.toastr.error(UserMessages.technicalIssue);
                return;
            }
        }

        this.googleAuthService.signIn(
            this.requiredGoogleScopes,
            '/settings/app/connections/new-bq'
        );
    }

    async step2_obtainBQProjects() {
        this.loadingProjects.set(true);
        try {
            const projectList = await this.googleAdminService.getProjects(
                this.data.org.big_query_datasource!
            );

            for (const project of projectList.projects) {
                const datasetsList = await this.googleAdminService.getDatasets(
                    this.data.org.big_query_datasource!,
                    project.id
                );

                this.data.datasets.push(...(datasetsList.datasets ?? []));
            }

            this.selectedBQDataset = this.data.datasets[0];
        } catch (err) {
            this.toastr.error(UserMessages.technicalIssue);
        } finally {
            this.loadingProjects.set(false);
        }
    }

    async step2_onNextClick() {
        const { projectId, datasetId } = this.selectedBQDataset.datasetReference;
        try {
            const tablesList = await this.googleAdminService.getTables(
                this.data.org.big_query_datasource!,
                projectId,
                datasetId
            );

            const tables =
                tablesList.tables
                    .map(t => t.tableReference.tableId)
                    .filter(name => /^events_\d+$/.test(name)) || [];

            if (tables.length === 0) {
                this.toastr.error(
                    `Unable to fetch event tables for provided dataset: ${datasetId}. Please select another dataset if applicable`
                );
                return;
            }

            const resp = await this.sbService.updateDatasource(
                this.data.org.big_query_datasource_id!,
                DatasourceTable.BigQuery,
                { project_id: projectId, dataset_id: datasetId }
            );

            if (resp.error) {
                this.toastr.error(UserMessages.technicalIssue);
                return;
            }

            const response = await this.sbService.client.rpc('finalize_datasource', {
                p_id: this.data.org.big_query_datasource_id!
            });

            if (response.error) {
                this.toastr.error(UserMessages.technicalIssue);
                return;
            }

            this.init('step3');
        } catch (err) {
            this.toastr.error(UserMessages.technicalIssue);
        }
    }
}
