export class Authtoken {

    id: number;
    access_token: string;
    refresh_token: string;
    expires_on: string;

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }

}