import { GaAdminWebStreamData } from "./ga-web-stream-data";

export class GaAdminDataStream {
    name: string;
    displayName: string;
    type: 'DATA_STREAM_TYPE_UNSPECIFIED	' | 'WEB_DATA_STREAM' | 'ANDROID_APP_DATA_STREAM' | 'IOS_APP_DATA_STREAM';
    webStreamData?: GaAdminWebStreamData;
    androidAppStreamData?: any;
    iosAppStreamData?: any;
}

export class GaAdminDataStreamList {
    dataStreams: GaAdminDataStream[];
    nextPageToken: string;
}
