import { inject, Injectable } from '@angular/core';
import { CaptureApiService } from './api/capture-api.service';
import {
    GetBlobSnapshotsPayload,
    RecordedSessionsListRequest
} from '../models/api/recorded-sessions.request';
import { BQDatasource, Datasource } from '../../services/api/models';
import { BQRecordedSessionMeta } from '../models/bq-recorded-session';
import { DateRange } from '../../shared/types/date-range';
import { eventWithTime } from '@rrweb/types';
import { inflate } from 'pako';

@Injectable({
    providedIn: 'root'
})
export class BQRRWebSessionsService {
    private readonly captureApiService = inject(CaptureApiService);

    private errorsState = {
        sessionMetaListError: null as any,
        recordedSessionEventsError: null as any
    };

    public async getRecordedSessionsMetaList(
        source: BQDatasource,
        dateRange: DateRange
    ): Promise<BQRecordedSessionMeta[]> {
        try {
            const plainSessionRows = await this.captureApiService.fetchRecordedSessionsMetaList(
                new RecordedSessionsListRequest({
                    dateRange,
                    projectId: source.project_id,
                    datasetId: source.dataset_id
                })
            );

            this.errorsState['sessionMetaListError'] = null;

            return plainSessionRows.map(s => BQRecordedSessionMeta.fromApi(s));
        } catch (err) {
            this.errorsState['sessionMetaListError'] = err;
            return [];
        }
    }

    public async getRecordedSessionEventsFromBlobStorage(
        source: Datasource,
        sessionId: string,
        // use range from lessionsListMeta for particular session
        dateRange: DateRange
    ): Promise<eventWithTime[]> {
        try {
            const compressedEvents =
                await this.captureApiService.fetchRecordedSessionEventsFromBlob(
                    new GetBlobSnapshotsPayload({
                        sessionId,
                        dateRange: dateRange,
                        measurementId: source.ga_measurement_id
                    })
                );
            this.errorsState['sessionMetaListError'] = null;

            return (
                compressedEvents
                    .map(this.parseRRWEbEventsFromCompressedString)
                    .filter(v => v !== null) as eventWithTime[]
            ).sort((a: eventWithTime, b: eventWithTime) => a.timestamp - b.timestamp);
        } catch (err) {
            this.errorsState['recordedSessionEventsError'] = err;
            return [];
        }
    }

    private parseRRWEbEventsFromCompressedString(event: string): eventWithTime | null {
        try {
            const binaryString = atob(event);
            const byteArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
            }
            const inflated = inflate(byteArray);
            const decodedString = new TextDecoder().decode(inflated);
            const parsedEvent = JSON.parse(decodedString);
            return parsedEvent as eventWithTime;
        } catch (err) {
            return null;
        }
    }
}
