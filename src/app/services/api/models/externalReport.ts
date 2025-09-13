export class ExternalReport {

    id: number;
    title: string;
    url: string;
    is_published: boolean;
    icon: string;

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }

}