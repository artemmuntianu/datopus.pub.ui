export class DimValues {

    ui_name: string;
    col_name: string;
    values: string[];

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }

}