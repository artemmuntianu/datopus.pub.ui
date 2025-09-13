
export class RecordedSessionMetaRow {
	session_id!: number;
	user_id!: string;
	rrweb_range_start!: Date;
	rrweb_range_end!: Date;
	event_count!: number;
	user_country?: string;
	device_type?: string;
	clicks_count?: number;
	keypress_count?: number;
	device_os?: string;
	device_browser?: string;
	start_page_url?: string;
}

export class RecordedSessionEventsBatchRow {
	event_string!: string;
	event_timestamp!: string;
}
