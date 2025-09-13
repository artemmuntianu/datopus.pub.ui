
export type SocialAccountType = 'x' | 'facebook' | 'linkedin';

export type SocialProfiles = Record<SocialAccountType, string>;

export interface UserMetaData {
    full_name: string;
    social_profiles?: SocialProfiles;
    picture?: string;
    phone?: string;
}