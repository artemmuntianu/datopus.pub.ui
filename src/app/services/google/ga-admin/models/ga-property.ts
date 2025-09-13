export class GaAdminProperty {
    name: string;
    displayName: string;

    getPropertyId() {
        return this.name.split('/').pop();
    }
}

export class GaAdminPropertyList {
    properties: GaAdminProperty[];
    nextPageToken: string;
};