import { Authtoken } from "./authToken";

export class Datasource {
	id: number;
	created_at: string;
	ga_property_id: string;
	ga_measurement_id: string;
	unique_id: string;
	auth_token_id: number | null;
	auth_step: string;
	auth_token?: Authtoken;

	constructor(obj: any) {
		if (!obj) return;

		Object.assign(this, obj);

		if (obj.auth_token) {
			this.auth_token = new Authtoken(obj.auth_token);
		}
	}
}

export enum DatasourceTable {
    GoogleAnalytics = 'datasource',
    BigQuery = 'big_query_datasource'
}

export class BQDatasource {
    id: number;
    project_id: string;
    dataset_id: string;
    unique_id: string;
    auth_step: string;
    auth_token_id: number | null;
    auth_token?: Authtoken;

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }
}