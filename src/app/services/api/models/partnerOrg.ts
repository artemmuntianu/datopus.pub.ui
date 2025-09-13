export class PartnerOrg {

    id: number;
    name: string;
    datasource_id: number;

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }

}