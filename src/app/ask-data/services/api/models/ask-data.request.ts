import { DateRange } from '../../../../shared/types/date-range';

export class AskDataRequest {
    public constructor(
        public question: string,
        public dateRange: DateRange
    ) {}
}
