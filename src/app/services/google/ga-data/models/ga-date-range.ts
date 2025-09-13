export class GaDataDateRange {
    startDate: string;
    endDate: string;

    constructor(startDate: Date, endDate: Date) {
        this.startDate = this.formatDateToUTC(startDate);
        this.endDate = this.formatDateToUTC(endDate);
    }

    private formatDateToUTC(date: Date): string {
        const utcDate = new Date(
            Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
        return utcDate.toISOString().split('T')[0];
    }
}
