export class GaAdminAccount {
    name: string;
    displayName: string;
}

export class GaAdminAccountList {
    accounts: GaAdminAccount[];
    nextPageToken: string
}