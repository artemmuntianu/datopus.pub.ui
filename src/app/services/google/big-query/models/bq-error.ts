
export class BQApiError extends Error {
    constructor(public code: BQApiErrorCode, message: string, public description?: string) {
        super(message);
        this.name = "BQApiError";
    }
}

export enum BQApiErrorCode {
    NO_ACCESS_TOKEN = "NO_ACCESS_TOKEN",
    INVALID_ACCOUNT = "INVALID_ACCOUNT",
    EXPIRED_REFRESH_TOKEN = "EXPIRED_REFRESH_TOKEN",
    NO_DATASET = "NO_DATASET",
    FORBIDDEN = "FORBIDDEN",
    UNAUTHORIZED = "UNAUTHORIZED",
    HTTP_ERROR = "HTTP_ERROR",
    NO_PROJECT_ID = "NO_PROJECT_ID",
    NO_DATASOURCE = "NO_DATASOURCE",
    FIELD_COUNT_MISMATCH = "FIELD_COUNT_MISMATCH",
    UNKNOWN_ERROR = "UNKOWN_ERROR"
}