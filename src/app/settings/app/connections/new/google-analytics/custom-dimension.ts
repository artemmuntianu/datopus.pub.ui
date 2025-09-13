import { GaAdminCustomDimension } from "../../../../../services/google/ga-admin/models/ga-custom-dimension";

export class CustomDimension extends GaAdminCustomDimension {
    exists: boolean;

    constructor(obj: any) {
        super();
        if (!obj)
            return;
        Object.assign(this, obj);
    }
}