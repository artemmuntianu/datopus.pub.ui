export class BQDataset {
    constructor(
        public kind: string,
        public id: string,
        public datasetReference: { projectId: string; datasetId: string },
        public labels: Record<string, string>,
        public location: string,
        public friendlyName?: string,
    ) {}
}

export class BQDatasetList {
    constructor(
        public kind: string,
        public etag: string,
        public nextPageToken: string,
        public unreachable: string[],
        public datasets?: BQDataset[],
    ) {}
}
