import { GaDataRunReportReq } from "./ga-run-report-req";

export type GaRequestData  = GaDataRunReportReq;

export enum GaRequestType {
    REPORT = 'report'
}

export class GaRequest<T extends GaRequestType> {
    type: T;
    payload: ExtractGaPayload<T>;

    constructor(type: T, payload: ExtractGaPayload<T>) {
        this.type = type;
        this.payload = payload;
    }
}

type ExtractGaPayload<T extends GaRequestType> = 
    T extends GaRequestType.REPORT ? GaDataRunReportReq :
    never;