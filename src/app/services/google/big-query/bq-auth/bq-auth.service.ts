import { Injectable, inject } from '@angular/core';
import {
    GoogleAuthService,
    GoogleOAuthAPIError,
    GoogleOAuthErrorType
} from '../../google-auth.service';
import { ConnectionsService } from '../../../api/connections.service';
import { Authtoken, BQDatasource, DatasourceTable } from '../../../api/models';
import { BQApiError, BQApiErrorCode } from '../models/bq-error';
import { GoogleService } from '../../google.service';
import { env } from '../../../../../environments/environment';
import { AuthService } from '../../../api/auth.service';

@Injectable({ providedIn: 'root' })
export class BQAuthService extends GoogleService {
    private googleAuthService = inject(GoogleAuthService);
    private connectionsService = inject(ConnectionsService);
    private authService = inject(AuthService);

    async ensureValidAuthToken(datasource: BQDatasource) {
        const tokenResponse = await this.googleAuthService.validateOrIssueNewAuthToken(datasource);

        if (
            tokenResponse?.error instanceof GoogleOAuthAPIError &&
            tokenResponse.error.detail?.code === GoogleOAuthErrorType.InvalidGrant
        ) {
            try {
                const tokenData = await this.googleAuthService.signInWindow([
                    'https://www.googleapis.com/auth/bigquery.readonly'
                ]);

                if (!tokenData) {
                    throw new BQApiError(
                        BQApiErrorCode.EXPIRED_REFRESH_TOKEN,
                        'Refresh token expired'
                    );
                }

                const hasAccess = await this.checkBigQueryAccess(
                    tokenData.accessToken,
                    datasource.project_id
                );
                if (!hasAccess) {
                    throw new BQApiError(
                        BQApiErrorCode.INVALID_ACCOUNT,
                        'Selected account does not have access to given datasource'
                    );
                }

                const response = await this.connectionsService.addAuthToken(
                    datasource.id,
                    DatasourceTable.BigQuery,
                    null,
                    tokenData
                );
                if (response instanceof Authtoken) {
                    datasource.auth_token = response;
                } else {
                    throw new BQApiError(BQApiErrorCode.UNKNOWN_ERROR, 'Unable to save token');
                }
            } catch (err) {
                if (err instanceof BQApiError) {
                    throw err;
                }
                throw new BQApiError(BQApiErrorCode.EXPIRED_REFRESH_TOKEN, 'Refresh token expired');
            }
        }
    }

    private async checkBigQueryAccess(accessToken: string, projectId: string): Promise<boolean> {
        try {
            const response = await fetch(`${env.apiBaseUrl}/bigquery/projects/${projectId}`, {
                headers: {
                    'X-Google-Auth-Token': `Bearer ${accessToken}`,
                    Authorization: `Bearer ${this.authService.getAccessToken()}`
                }
            });

            return response.status === 200;
        } catch {
            return false;
        }
    }
}
