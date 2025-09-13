export class GaAdminCustomDimension {
    name: string;
    parameterName: string;
    displayName: string;
    description: string;
    scope: 'EVENT' | 'USER' | 'ITEM';
}

// API doesnt say but it may return empty object {} for 200 OK
export class GaAdminCustomDimensionList {
    customDimensions?: GaAdminCustomDimension[];
    nextPageToken: string;
}
