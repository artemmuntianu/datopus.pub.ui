import { InvoiceItem } from "./subscription-plan.response";

export class BillingDetails {
    subtotal: number;
    taxes: number;
    total: number;
    dueDate: Date;
    totalDueToday?: number;
    currency: string;
    nextPaymentDate?: Date;
    periodStart?: Date;
    periodEnd?: Date;
    items?: InvoiceItem[];

    constructor(
        subtotal: number,
        taxes: number,
        total: number,
        currency: string,
        dueDate: Date,
        totalDueToday?: number,
        nextPaymentDate?: Date,
        periodStart?: Date,
        periodEnd?: Date,
        items?: InvoiceItem[]
    ) {
        this.subtotal = subtotal;
        this.taxes = taxes;
        this.dueDate = dueDate;
        this.total = total;
        this.currency = currency;
        this.totalDueToday = totalDueToday;
        this.nextPaymentDate = nextPaymentDate;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.items = items;
    }

    static empty(currency: string): BillingDetails {
        return new BillingDetails(0, 0, 0, currency, new Date());
    }
}