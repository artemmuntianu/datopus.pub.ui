import { RecordedSessionMetaRow } from './api/recorded-sessions.response';

export class BQRecordedSessionMeta {
    constructor(
        public start: Date,
        public end: Date,
        public userId: string,
        public sessionId: string,
        public clickCount?: number,
        public keyPressCount?: number,
        public userCountry?: string,
        public deviceType?: string,
        public deviceBrowser?: string,
        public deviceOs?: string,
        public startPage?: string
    ) {}

    public static fromApi(session: RecordedSessionMetaRow) {
        return new BQRecordedSessionMeta(
            session.rrweb_range_start,
            session.rrweb_range_end,
            session.user_id,
            session.session_id.toString(),
            session.clicks_count,
            session.keypress_count,
            session.user_country,
            session.device_type,
            session.device_browser,
            session.device_os,
            session.start_page_url,
        );
    }
}



