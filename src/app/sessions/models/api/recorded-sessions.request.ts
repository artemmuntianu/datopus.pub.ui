import { DateRange } from "../../../shared/types/date-range";

export class RecordedSessionsListRequest {
    public date_range: {
		start: Date;
		end: Date;
	};
    public project_id: string;
	public dataset_id: string;

    constructor(params: { dateRange: DateRange; projectId: string, datasetId: string }) {
        this.date_range = params.dateRange;
        this.project_id = params.projectId;
		this.dataset_id = params.datasetId;
    }
}

export class RecordedSessionEventsBQPayload {
	public session_id: string;
	public project_id: string;
	public date_range: DateRange;
	public dataset_id: string;

	constructor(params: {
		sessionId: string;
		projectId: string;
		dateRange: DateRange;
		datasetId: string;
	}) {
		this.session_id = params.sessionId;
		this.project_id = params.projectId;
		this.date_range = params.dateRange;
		this.dataset_id = params.datasetId;
	}
}

export class GetBlobSnapshotsPayload {
	public session_id: string;
	public date_range: DateRange;
	public measurement_id: string;

	constructor(params: {
		sessionId: string;
		dateRange: DateRange;
		measurementId: string;
	}) {
		this.session_id = params.sessionId;
		this.date_range = params.dateRange;
		this.measurement_id = params.measurementId;
	}
}

