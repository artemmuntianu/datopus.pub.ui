import { Injectable } from '@angular/core';
import { Datasource } from '../../api/models/datasource';
import { GoogleAuthService } from '../google-auth.service';
import { GoogleService } from '../google.service';
import { GaAdminAccount, GaAdminAccountList } from './models/ga-account';
import { GaAdminCustomDimension, GaAdminCustomDimensionList } from './models/ga-custom-dimension';
import { GaAdminDataStreamList } from './models/ga-data-stream';
import { GaAdminProperty, GaAdminPropertyList } from './models/ga-property';

@Injectable({
    providedIn: 'root'
})
export class GAAdminService extends GoogleService {

    readonly apiBaseUrl = 'https://analyticsadmin.googleapis.com/v1beta';

    constructor(private googleAuthService: GoogleAuthService) {
        super();
    }

    async getAccounts(datasource: Datasource) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        return this.fetchData<GaAdminAccountList>(`${this.apiBaseUrl}/accounts?pageSize=${200}`, datasource.auth_token!.access_token, 'GET');
    }

    async getProperties(datasource: Datasource, gaAccount: GaAdminAccount) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        return this.fetchData<GaAdminPropertyList>(`${this.apiBaseUrl}/properties?filter=parent:${gaAccount.name}&pageSize=${200}`, datasource.auth_token!.access_token, 'GET');
    }

    async getCustomDimensions(datasource: Datasource, ga_property_id: string) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        return this.fetchData<GaAdminCustomDimensionList>(`${this.apiBaseUrl}/properties/${ga_property_id}/customDimensions?pageSize=${200}`, datasource.auth_token!.access_token, 'GET');
    }

    async addCustomDimensions(datasource: Datasource, ga_property_id: string, cds: GaAdminCustomDimension[]) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        const promises = [];
        for (const cd of cds) {
            const opts = {
                headers: {
                    'Authorization': `Bearer ${datasource.auth_token!.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parameterName: cd.parameterName,
                    displayName: cd.displayName,
                    description: cd.description,
                    scope: cd.scope
                })
            };
            promises.push(this.fetchData(`${this.apiBaseUrl}/properties/${ga_property_id}/customDimensions`, datasource.auth_token!.access_token, 'POST', opts));
        }
        return Promise.all(promises);
    }

    async getDataStreams(datasource: Datasource, gaProperty: GaAdminProperty) {
        await this.googleAuthService.validateOrIssueNewAuthToken(datasource);
        return this.fetchData<GaAdminDataStreamList>(`${this.apiBaseUrl}/${gaProperty.name}/dataStreams?pageSize=${200}`, datasource.auth_token!.access_token, 'GET');
    }
}