
export class GAApiError extends Error {
    constructor(public code: GAApiErrorCode, message: string, public description?: string) {
        super(message);
        this.name = "GAApiError";
    }
}

export enum GAApiErrorCode {
    NO_DATASOURCE = "NO_DATASOURCE",
	UNKNOWN_ERROR = "UKNOWN_ERROR"
}