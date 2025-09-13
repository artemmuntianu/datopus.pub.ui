

export enum SubscriptionStatus {
    Active = "active",
    // change to trialing as in stripe
    Trial = "trial",
    Incomplete = "incomplete",
    IncompleteExpired = "incomplete_expired",
    PastDue = "past_due",
    Canceled = "canceled",
    Unpaid = "unpaid",
    Paused = "paused",
    Startup = "startup"
}