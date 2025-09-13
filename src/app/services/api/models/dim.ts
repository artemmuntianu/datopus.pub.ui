export class Dim {

    ui_name: string;
    col_name: string;

    constructor(obj: any) {
        if (!obj)
            return;
        Object.assign(this, obj);
    }

}