import { Injectable } from '@angular/core';
import { AuthChangeEvent, AuthSession, Session, SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { env } from '../../../environments/environment';
import { OnboardingStateService } from '../onboarding/onboarding-state.service';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from './models/user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private _session: AuthSession | null;

    constructor(
        public sbService: SupabaseService,
        private onboardingStateService: OnboardingStateService
    ) {
        this._session = null;
        this.initializeSession();
    }

    get session(): Readonly<AuthSession> | null {
        return this._session;
    }

    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.sbService.client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            this._session = session;

            callback(event, session);
        });
    }

    getAccessToken() {
        return this._session?.access_token;
    }

    async signIn(email: string, password: string) {
        return await this.sbService.client.auth.signInWithPassword({ email, password });
    }

    async signInWithOAuth(creds: SignInWithOAuthCredentials) {
        return await this.sbService.client.auth.signInWithOAuth(creds);
    }

    async signUp(name: string, email: string, password: string, orgName: string, orgType: string) {
        return await this.sbService.client.auth.signUp(
            {
                email,
                password,
                options: {
                    emailRedirectTo: `${env.appBaseUrl}/auth/confirm-activation`, // address to redirect user to after a successfull account activation
                    data: {
                        full_name: name,
                        orgName,
                        orgType
                    }
                }
            }
        );
    }

    async signOut() {
        return await this.sbService.client.auth.signOut();
    }

    async resetPassword(email: string) {
        return await this.sbService.client.auth.resetPasswordForEmail(email, {
            redirectTo: `${env.appBaseUrl}/auth/reset-password`,
        })
    }

    async setPassword(newPassword: string) {
        return await this.sbService.client.auth.updateUser({ password: newPassword })
    }

    private async initializeSession(): Promise<void> {
        const { data } = await this.sbService.client.auth.getSession();
        this._session = data.session;

        if (this._session && User.current) {
            await this.onboardingStateService.initialize(User.current.orgId);
        }
    }
}