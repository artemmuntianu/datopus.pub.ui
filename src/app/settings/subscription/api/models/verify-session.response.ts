import { SubscriptionStatus } from './subscription-status';

export class VerifySubscriptionSessionResponse {
    public constructor(
        public message: string,
        public subscriptionId: string,
        public status: SubscriptionStatus
    ) {}
}
