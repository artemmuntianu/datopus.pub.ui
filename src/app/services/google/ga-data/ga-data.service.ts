import { Injectable } from '@angular/core';
import { Datasource } from '../../api/models/datasource';
import { GoogleAuthService } from '../google-auth.service';
import { GoogleService } from '../google.service';
import { GaDataRunReportReq, GaDataRunReportResp } from './models';
import { GaMetadata } from './models/ga-metadata-resp';
import { GaCheckCompitabilityReq } from './models/ga-check-compitability-req';
import { GaCheckCompitabilityResp } from './models/ga-check-compitability-resp';
import { GaDataRunRealtimeReportReq } from './models/ga-run-realtime-report-req';
import { GaDataRunRealtimeReportResp } from './models/ga-run-realtime-report-resp';

@Injectable({
    providedIn: 'root'
})
export class GADataService extends GoogleService {
    readonly apiBaseUrl = 'https://analyticsdata.googleapis.com/v1beta';

    constructor(private googleAuthService: GoogleAuthService) {
        super();
    }

    async runReport(datasource: Datasource, req: GaDataRunReportReq) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        const access_token = datasource.auth_token!.access_token;
        const opts = {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        };
        return this.fetchData<GaDataRunReportResp>(`${this.apiBaseUrl}/properties/${datasource.ga_property_id}:runReport`, access_token, 'POST', opts);
    }

    async runRealTimeReport(datasource: Datasource, req: GaDataRunRealtimeReportReq) {        
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        const access_token = datasource.auth_token!.access_token;
        const opts = {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        };
        return this.fetchData<GaDataRunRealtimeReportResp>(`${this.apiBaseUrl}/properties/${datasource.ga_property_id}:runRealtimeReport`, access_token, 'POST', opts);
    }

    async getMetaData(datasource: Datasource) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        const access_token = datasource.auth_token!.access_token;
        const opts = {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
        };
        return this.fetchData<GaMetadata>(`${this.apiBaseUrl}/properties/${datasource.ga_property_id}/metadata`, access_token, 'GET', opts)
    }

    async checkCompatibility(datasource: Datasource, req: GaCheckCompitabilityReq) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        const access_token = datasource.auth_token!.access_token;
        const opts = {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        };
        return this.fetchData<GaCheckCompitabilityResp>(`${this.apiBaseUrl}/properties/${datasource.ga_property_id}:checkCompatibility`, access_token, 'POST', opts)
    }
}