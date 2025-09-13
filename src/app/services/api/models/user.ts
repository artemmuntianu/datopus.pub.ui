import { OrgType, SubscriptionType, UserRole } from '../../../enums';
import { PriceLookupKey } from '../../../settings/subscription/api/models/price-lookup-keys';
import { ProductKey } from '../../../settings/subscription/api/models/product-key';
import { SocialProfiles, UserMetaData } from '../interfaces/user';

export class User implements UserMetaData {
    static version: string = '1.0'; /* should be equal to value in API */

    id: string;
    orgId: number;
    orgType: OrgType;
    orgSubscription: PriceLookupKey;
    partnerOrgId: number;
    version: string;
    social_profiles: SocialProfiles;
    full_name: string;
    picture: string;
    email: string;
    role: UserRole;
    phone: string;

    constructor(obj: any) {
        if (!obj) return;
        Object.assign(this, obj);
    }

    static set current(user: any) {
        if (!user) localStorage.setItem('currentUser', '');
        else localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static get current(): User | null {
        if (this.isSet)
            return new User(
                JSON.parse(<string>localStorage.getItem('currentUser'))
            );
        return null;
    }

    static get isSet() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const user: User = JSON.parse(userStr);
            if (user.version === User.version) return true;
        }
        return false;
    }
}
