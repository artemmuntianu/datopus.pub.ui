
export class DashboardApiError extends Error {
    constructor(public code: DashboardApiErrorCode, message: string, public description?: string) {
        super(message);
        this.name = "Dashboard Error";
    }
}

export enum DashboardApiErrorCode {
	DB_ERROR = "DB_ERROR",
    NOT_FOUND = "NOT_FOUND",
    UNKNOWN_ERROR = "UNKOWN_ERROR"
}