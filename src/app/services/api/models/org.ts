import { OrgType, SubscriptionType } from "../../../enums";
import { BQDatasource, Datasource } from "./datasource";

export class Org {

    id: number;
    name: string;
    datasource_id: number | null;
    big_query_datasource_id: number | null;
    type: OrgType;
    subscription: SubscriptionType;
    datasource?: Datasource;
    big_query_datasource?: BQDatasource;

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }

    get isDemo() {
        return ['B2B Organization', 'B2C Organization'].includes(this.name);
    }

    get isPremium() {
        return this.subscription === SubscriptionType.premium;
    }

}