import { Injectable } from '@angular/core';
import { env } from '../../../environments/environment';
import { localDateToUtc } from '../../../utilities';
import { OneMinuteMs, UserMessages } from '../../consts';
import { ConnectionsService } from '../api/connections.service';
import { Authtoken, BQDatasource, Datasource, DatasourceTable } from '../api/models';
import { GoogleService } from './google.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../api/auth.service';

export class GoogleOAuthAPIError extends Error {
    status: number;
    detail: GoogleOAuthErrorBody | null;

    constructor(message: string, status: number, detail: GoogleOAuthErrorBody | null) {
        super(message);
        this.status = status;
        this.detail = detail;
    }
}

export enum GoogleOAuthErrorType {
    InvalidGrant = 'invalid_grant',
    InvalidRequest = 'invalid_request',
    UnauthorizedClient = 'unauthorized_client',
    UnsupportedGrantType = 'unsupported_grant_type',
    InvalidScope = 'invalid_scope'
}

export interface GoogleOAuthErrorBody {
    status: number;
    title: string;
    type: string;
    message: string;
    instance: string;
    timestamp: string;
    code: GoogleOAuthErrorType;
    description: string;
    uri?: string;
}

export interface GoogleOAuth2TokenResp {
    accessToken: string;
    tokenType: string;
    expiresInSeconds: number;
    refreshToken: string;
    scope: string;
    idToken: string | null;
    issued: string;
    issuedUtc: string;
    isStale: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthService extends GoogleService {
    private readonly redirectBaseUri: string;

    constructor(
        private connectionsService: ConnectionsService,
        private authService: AuthService,
        private toastr: ToastrService
    ) {
        super();
        this.redirectBaseUri = env.appBaseUrl;
    }

    private buildGoogleAuthUrl(scopes: string[]): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: `${window.location.origin}/google-oauth/callback`,
            scope: scopes.join(' '),
            access_type: 'offline',
            include_granted_scopes: 'true',
            response_type: 'code',
            prompt: 'select_account consent'
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async signInWindow(scopes: string[]) {
        return new Promise<GoogleOAuth2TokenResp>((resolve, reject) => {
            const authUrl = this.buildGoogleAuthUrl(scopes);

            const popup = window.open(authUrl, 'google-oauth-popup', 'width=500,height=600');

            if (!popup) {
                reject(new Error('Failed to open popup'));
                return;
            }

            const checkPopupClosed = setInterval(() => {
                if (!popup || popup.closed) {
                    clearInterval(checkPopupClosed);
                    window.removeEventListener('message', messageListener);
                    reject(new Error('Popup closed by user'));
                }
            }, 500);

            const messageListener = async (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;

                clearInterval(checkPopupClosed);
                window.removeEventListener('message', messageListener);

                const { code, error } = event.data;

                if (code) {
                    try {
                        const { data, error } = await this.exchangeAuthCodeForAccessToken(
                            code,
                            `/google-oauth/callback`
                        );

                        if (error) {
                            reject(new Error(error));
                        } else {
                            resolve(data!);
                        }
                    } catch (err) {
                        reject(err);
                    }
                } else if (error) {
                    reject(new Error(error));
                }
            };

            window.addEventListener('message', messageListener);
        });
    }

    /**
     * Request auth code from Google's OAuth 2.0 server.
     */
    signIn(scopes: string[], redirect = '/settings/app/connections/new') {
        // Google's OAuth 2.0 endpoint for requesting an auth code
        let oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

        // Create element to open OAuth 2.0 endpoint in new window.
        let form = document.createElement('form');
        form.setAttribute('method', 'GET'); // Send as a GET request.
        form.setAttribute('action', oauth2Endpoint);

        // Parameters to pass to OAuth 2.0 endpoint.
        let params = <any>{
            scope: scopes.join(' '),
            access_type: 'offline',
            include_granted_scopes: 'true',
            response_type: 'code',
            prompt: 'select_account consent',
            client_id: this.clientId,
            redirect_uri: this.redirectBaseUri + redirect
        };

        // Add form parameters as hidden input values.
        for (let p in params) {
            let input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', p);
            input.setAttribute('value', params[p]);
            form.appendChild(input);
        }

        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();
    }

    async exchangeAuthCodeForAccessToken(code: string, redirect = '/settings/app/connections/new') {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.authService.getAccessToken()}`
            },
            body: JSON.stringify({
                code,
                redirect_uri: this.redirectBaseUri + redirect
            })
        };

        const result: {
            data: GoogleOAuth2TokenResp | undefined;
            error: any;
        } = { data: undefined, error: undefined };

        try {
            const resp = await fetch(`${env.apiBaseUrl}/auth/google/token`, opts);
            if (!resp.ok) throw new Error(resp.statusText);
            result.data = await resp.json();
        } catch (e: any) {
            result.error = e;
        }

        return result;
    }

    async exchangeRefreshTokenForAccessToken(refreshToken: string) {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.authService.getAccessToken()}`
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        };

        try {
            const resp = await fetch(`${env.apiBaseUrl}/auth/google/refresh`, opts);

            if (!resp.ok) {
                const errorBody: GoogleOAuthErrorBody | null = await resp.json().catch(() => null);
                throw new GoogleOAuthAPIError(resp.statusText, resp.status, errorBody);
            }

            return { data: (await resp.json()) as GoogleOAuth2TokenResp, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async validateOrIssueNewAuthToken(datasource: Datasource | BQDatasource) {
        // if expires later than one minute from now
        if (
            new Date(datasource.auth_token!.expires_on) >
            localDateToUtc(new Date(Date.now() + OneMinuteMs))
        )
            return;

        const tokenResp = await this.exchangeRefreshTokenForAccessToken(
            datasource.auth_token!.refresh_token
        );

        if (tokenResp.error) {
            this.toastr.error(UserMessages.unableToReauthorize);
            return tokenResp;
        }

        tokenResp.data!.refreshToken = datasource.auth_token!.refresh_token;

        const dbResp = await this.connectionsService.addAuthToken(
            datasource.id,
            datasource instanceof Datasource
                ? DatasourceTable.GoogleAnalytics
                : DatasourceTable.BigQuery,
            null,
            tokenResp.data!
        );

        if (dbResp instanceof Authtoken) {
            datasource.auth_token = dbResp;
        } else {
            this.toastr.error(UserMessages.unableToReauthorize);
        }
        return tokenResp;
    }
}
