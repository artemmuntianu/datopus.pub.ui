export class BQProject {
    constructor(
        public kind: string,
        public id: string,
        public numericId: string,
        public projectReference: { projectId: string },
        public friendlyName: string
    ) {}
}
export class BQProjectList {
    constructor(
        public kind: string,
        public etag: string,
        public nextPageToken: string,
        public projects: BQProject[],
        public totalItems: number
    ) {}
}
