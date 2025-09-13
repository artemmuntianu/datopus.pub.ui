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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMessages } from '../../../../../consts';
import { ConnectionsService } from '../../../../../services/api/connections.service';
import { Authtoken, DatasourceTable, Org, User } from '../../../../../services/api/models';
import { GAAdminService } from '../../../../../services/google/ga-admin/ga-admin.service';
import { GaAdminProperty } from '../../../../../services/google/ga-admin/models/ga-property';
import { GoogleAuthService } from '../../../../../services/google/google-auth.service';
import { SupabaseService } from '../../../../../services/supabase/supabase.service';
import { CustomDimension } from './custom-dimension';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrackerCodeSnippetComponent } from "../../tracker-code-snippet/tracker-code-snippet.component";
import { GettingStartedService } from '../../../../../getting-started/getting-started.service';

@Component({
    selector: 'app-ga-new-connection',
    standalone: true,
    imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatStepperModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    TrackerCodeSnippetComponent
],
    templateUrl: './ga-new-connection.component.html',
    styleUrl: './ga-new-connection.component.scss',
})
export class GANewConnectionComponent {
    @ViewChild(MatStepper) stepper: MatStepper;

    selectedGaProperty: GaAdminProperty;
    curStep: number;
    user = User.current!;
    obtainingProperties = signal(false);
    data = {
        org: <Org>{},
        gaProperties: <GaAdminProperty[]>[],
    };
    requiredGoogleScopes = [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/analytics.edit',
    ];
    datasourceIdentifier = '';

    private gettingStartedService = inject(GettingStartedService);

    datopusCustomDims = [
        new CustomDimension({
            parameterName: 'elemTag',
            displayName: 'Elem Tag',
            description: 'Datopus Elem Tag',
            scope: 'EVENT',
        }),
        new CustomDimension({
            parameterName: 'elemName',
            displayName: 'Elem Name',
            description: 'Datopus Elem Name',
            scope: 'EVENT',
        }),
        new CustomDimension({
            parameterName: 'elemText',
            displayName: 'Elem Text',
            description: 'Datopus Elem Text',
            scope: 'EVENT',
        }),
        new CustomDimension({
            parameterName: 'elemEvent',
            displayName: 'Elem Event',
            description: 'Datopus Elem Event',
            scope: 'EVENT',
        }),
        new CustomDimension({
            parameterName: 'eventType',
            displayName: 'Event Type',
            description: 'Datopus Event Type',
            scope: 'EVENT',
        }),
        new CustomDimension({
            parameterName: 'feature',
            displayName: 'Feature',
            description: 'Datopus Feature',
            scope: 'EVENT',
        }),
        new CustomDimension({
            parameterName: 'prevFeature',
            displayName: 'Previous Feature',
            description: 'Datopus Previous Feature',
            scope: 'EVENT',
        }),
    ];
    step3_tableColumns = [
        'exists',
        'name',
        'displayName',
        'description',
        'scope',
    ];
    step3_tableDatasource = new MatTableDataSource<CustomDimension>([]);

    constructor(
        private sbService: SupabaseService,
        private googleAuthService: GoogleAuthService,
        private googleAdminService: GAAdminService,
        private connectionsService: ConnectionsService,
        private toastr: ToastrService
    ) {
        // empty
    }

    async ngOnInit() {
        const resp = await this.sbService.getOrg(this.user.orgId, [
            'datasource',
            'auth_token',
        ]);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            this.init('step1');
            return;
        }
        this.data.org = <any>resp.data[0];

        if (this.data.org.datasource?.unique_id)
            this.datasourceIdentifier = this.data.org.datasource.unique_id;

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
            const resp =
                await this.googleAuthService.exchangeAuthCodeForAccessToken(
                    urlParams.get('code')!
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
                this.data.org.datasource_id!,
                DatasourceTable.GoogleAnalytics,
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
            const step = this.data.org.datasource
                ? this.data.org.datasource.auth_step
                : 'step1';
            this.init(step);
        }
    }

    init(step: string) {
        switch (step) {
            case 'step1':
                this.selectStepperStep(1);
                break;
            case 'step2':
                this.selectStepperStep(2);
                this.step2_obtainGaProperties();
                break;
            case 'step3':
                this.selectStepperStep(3);
                this.step3_obtainGaDimensions();
                break;
            case 'step4':
                this.selectStepperStep(4);
                this.gettingStartedService.completeStep('connect-analytics');
                break;
        }
    }

    refreshPage() {
        window.location.reload();
    }

    selectAnotherAccount() {
        this.googleAuthService.signIn(this.requiredGoogleScopes);
    }

    selectStepperStep(step: number) {
        for (let i = 0; i < step; i++)
            this.stepper.selectedIndex = i;
        this.curStep = step;
    }

    async step1_onNextClick() {
        if (!this.data.org.datasource_id) {
            const apiError = await this.connectionsService.addDatasource(
                DatasourceTable.GoogleAnalytics,
                this.data.org.id
            );
            if (apiError) {
                this.toastr.error(UserMessages.technicalIssue);
                return;
            }
        }

        this.googleAuthService.signIn(this.requiredGoogleScopes);
    }

    async step2_obtainGaProperties() {
        this.obtainingProperties.set(true);

        const accountsResp = await this.googleAdminService.getAccounts(
            this.data.org.datasource!
        );

        if (accountsResp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            this.obtainingProperties.set(false);
            return;
        }
        const accountsList = accountsResp.data;

        for (const account of accountsList?.accounts ?? []) {
            const propertiesResp = await this.googleAdminService.getProperties(
                this.data.org.datasource!,
                account
            );
            if (propertiesResp.error) {
                this.toastr.error(UserMessages.technicalIssue);
                this.obtainingProperties.set(false);
                return;
            }
            const propertiesList = propertiesResp.data!;
            this.data.gaProperties.push(...propertiesList.properties);
        }

        if (this.data.gaProperties.length > 0) {
            this.selectedGaProperty = this.data.gaProperties[0];
        } else {
            this.toastr.error(UserMessages.noGaPropertiesFound);
        }
        this.obtainingProperties.set(false);
    }

    async step2_onNextClick() {
        const dataStreamsResp = await this.googleAdminService.getDataStreams(
            this.data.org.datasource!,
            this.selectedGaProperty
        );
        if (dataStreamsResp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }
        const dataStreamsList = dataStreamsResp.data!;

        const webStream = dataStreamsList.dataStreams.find(
            (x) => x.type === 'WEB_DATA_STREAM'
        );
        if (!webStream) {
            this.toastr.error(UserMessages.unableToReauthorize);
            return;
        }

        const datasourceFields = {
            unique_id: this.datasourceIdentifier,
            ga_property_id: this.selectedGaProperty.name.split('/').pop()!,
            ga_measurement_id: webStream.webStreamData!.measurementId,
            auth_step: 'step3',
        };
        const resp = await this.sbService.updateDatasource(
            this.data.org.datasource_id!,
            DatasourceTable.GoogleAnalytics,
            datasourceFields
        );
        if (resp.error) {
            if (resp.error.message.includes('duplicate key value'))
                this.toastr.error(
                    'Connection with this name already exists. Please enter another name.'
                );
            else
                this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        Object.assign(this.data.org.datasource!, datasourceFields);

        this.init('step3');
    }

    async step3_obtainGaDimensions() {
        const existingCdsResp =
            await this.googleAdminService.getCustomDimensions(
                this.data.org.datasource!,
                this.data.org.datasource!.ga_property_id
            );
        if (existingCdsResp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        const existingCdsList = existingCdsResp.data!;

        const customDims = <CustomDimension[]>[];
        for (const cd of this.datopusCustomDims) {
            const existingCD = existingCdsList.customDimensions?.find(
                (x) => x.parameterName === cd.parameterName && x.scope === 'EVENT'
            );
            const newObject = Object.assign(
                { exists: existingCD != undefined },
                cd
            );
            customDims.push(new CustomDimension(newObject));
        }
        this.step3_tableDatasource.data = customDims;
    }

    async step3_onNextClick() {
        const cdsToAdd = this.step3_tableDatasource.data.filter(
            (x) => !x.exists
        );
        if (cdsToAdd.length)
            try {
                await this.googleAdminService.addCustomDimensions(
                    this.data.org.datasource!,
                    this.data.org.datasource!.ga_property_id,
                    cdsToAdd
                );
            } catch (e) {
                this.toastr.error(UserMessages.technicalIssue);
                return;
            }

        const resp = await this.sbService.updateDatasource(
            this.data.org.datasource_id!,
            DatasourceTable.GoogleAnalytics,
            { auth_step: 'step4' }
        );
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.init('step4');
    }
}
