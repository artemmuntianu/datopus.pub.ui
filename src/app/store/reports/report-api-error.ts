
export class ReportApiError extends Error {
    constructor(public code: ReportApiErrorCode, message: string, public description?: string) {
        super(message);
        this.name = "ReportApiError";
    }
}

export enum ReportApiErrorCode {
	DB_ERROR = "DB_ERROR",
    NOT_FOUND = "NOT_FOUND",
	UNKNOWN_ERROR = "UNKNOWN_ERROR"
}