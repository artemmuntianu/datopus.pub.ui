import { Injectable, inject } from '@angular/core';
import { BQDatasource } from '../../../api/models';
import { GoogleAuthService } from '../../google-auth.service';
import { GoogleService } from '../../google.service';
import { BQProjectList } from '../models/bq-project';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../api/auth.service';
import { firstValueFrom } from 'rxjs';
import { BQDatasetList } from '../models/bq-dataset';
import { BQTablesList } from '../models/bq-table';
import { env } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BQAdminService extends GoogleService {
    readonly apiBaseUrl = env.apiBaseUrl;
    readonly httpClient = inject(HttpClient);
    readonly authService = inject(AuthService);

    constructor(private googleAuthService: GoogleAuthService) {
        super();
    }

    async getProjects(datasource: BQDatasource) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);

        return firstValueFrom(
            this.httpClient.get<BQProjectList>(`${this.apiBaseUrl}/bigquery/projects`, {
                headers: {
                    Authorization: `Bearer ${this.authService.getAccessToken()}`,
                    'X-Google-Auth-Token': `${datasource.auth_token!.access_token}`
                }
            })
        );
    }

    async getDatasets(datasource: BQDatasource, projectId: string) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);

        return firstValueFrom(
            this.httpClient.get<BQDatasetList>(
                `${this.apiBaseUrl}/bigquery/projects/${projectId}/datasets`,
                {
                    headers: {
                        Authorization: `Bearer ${this.authService.getAccessToken()}`,
                        'X-Google-Auth-Token': `${datasource.auth_token!.access_token}`
                    }
                }
            )
        );
    }

    async getTables(datasource: BQDatasource, projectId: string, datasetId: string) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);

        return firstValueFrom(
            this.httpClient.get<BQTablesList>(
                `${this.apiBaseUrl}/bigquery/projects/${projectId}/datasets/${datasetId}/tables`,
                {
                    headers: {
                        Authorization: `Bearer ${this.authService.getAccessToken()}`,
                        'X-Google-Auth-Token': `${datasource.auth_token!.access_token}`
                    }
                }
            )
        );
    }
}
