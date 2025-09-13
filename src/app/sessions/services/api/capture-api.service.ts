import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetBlobSnapshotsPayload, RecordedSessionEventsBQPayload, RecordedSessionsListRequest } from '../../models/api/recorded-sessions.request';
import { env } from '../../../../environments/environment';
import { BQResponse } from '../../../services/google/big-query/models/bq-query-resp';
import { firstValueFrom } from 'rxjs';
import { RecordedSessionEventsBatchRow, RecordedSessionMetaRow } from '../../models/api/recorded-sessions.response';
import { AuthService } from '../../../services/api/auth.service';
import { BQMapper } from '../../../services/google/big-query/mappers/bq-rows.mapper';

@Injectable({
    providedIn: 'root'
})
export class CaptureApiService {
    private readonly httpClient = inject(HttpClient);
    private readonly authService = inject(AuthService);

    private readonly baseApiUrl = env.apiBaseUrl;
    private readonly endpointUrl = `${this.baseApiUrl}/capture`;

    public async fetchRecordedSessionsMetaList(request: RecordedSessionsListRequest) {
        const response = await firstValueFrom(
            this.httpClient.post<BQResponse>(`${this.endpointUrl}/recorded-sessions`, request, {
                headers: {
                    Authorization: `Bearer ${this.authService.getAccessToken()}`,
                }
            })
        );

        const sessionsMetas = BQMapper.map<RecordedSessionMetaRow>(response);

        return sessionsMetas;
    }


	public async fetchRecordedSessionEventsFromBigQuery(request: RecordedSessionEventsBQPayload) {
        const response = await firstValueFrom(
            this.httpClient.post<BQResponse>(`${this.endpointUrl}/session-bq-snapshots`, request, {
                headers: {
                    Authorization: `Bearer ${this.authService.getAccessToken()}`,
                }
            })
        );

        const sessionsBQEvents = BQMapper.map<RecordedSessionEventsBatchRow>(response);

        return sessionsBQEvents;
    }


	public async fetchRecordedSessionEventsFromBlob(request: GetBlobSnapshotsPayload) {
        const sessionsBlobEvents = await firstValueFrom(
            this.httpClient.post<string[]>(`${this.endpointUrl}/session-blob-snapshots`, request, {
                headers: {
                    Authorization: `Bearer ${this.authService.getAccessToken()}`,
                }
            })
        );


        return sessionsBlobEvents;
    }
}

