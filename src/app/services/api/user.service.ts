import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthError, UserResponse } from '@supabase/supabase-js';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { env } from '../../../environments/environment';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';
import { BaseApiService } from './base-api.service';
import { UserMetaData } from './interfaces/user';
import { User } from './models';

@Injectable({
    providedIn: 'root',
})
export class UserService extends BaseApiService {

    private user$ = new BehaviorSubject<User | null>(null);

    private readonly httpClient = inject(HttpClient);
    private readonly sbService = inject(SupabaseService);
    private readonly authService = inject(AuthService);

    getUser() {
        return this.user$.asObservable();
    }

    async updateMetaData(data: Partial<UserMetaData>): Promise<UserResponse> {
        return this.sbService.client.auth.updateUser({ data });
    }

    async updateEmail(
        email: string,
        emailRedirectTo = `${env.appBaseUrl}/auth/confirm-email-change`
    ): Promise<UserResponse> {
        return this.sbService.client.auth.updateUser(
            { email },
            { emailRedirectTo }
        );
    }

    async updatePassword(newPassword: string): Promise<UserResponse> {
        const userEmail = this.user$.value?.email;

        if (!userEmail) {
            return {
                error: new AuthError('Email is not found', 401),
                data: { user: null },
            };
        }

        return this.authService.setPassword(newPassword);
    }

    async uploadProfileImage(image: FormData): Promise<string> {
        return firstValueFrom(
            this.httpClient.post<string>(
                `${env.apiBaseUrl}/user/${this.user$.value?.id}/profile/image`,
                image,
                {
                    headers: {
                        Authorization: `Bearer ${this.authService.getAccessToken()}`,
                    },
                }
            )
        );
    }

    setUser(user: User | null) {
        // TODO: skip emitting if user properties haven't changed.
        this.user$.next(user);
    }
}
