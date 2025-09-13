import { inject, Injectable } from '@angular/core';
import { env } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/api/auth.service';

@Injectable()
export class SupportApiService {
    private readonly httpClient = inject(HttpClient);
    private readonly authService = inject(AuthService);

    private readonly baseApiUrl = env.apiBaseUrl;

    public async sendSupportRequest(message: string, subject: string, allowProjectSupport: boolean, screenshots: File[]) {
        const formData = new FormData();

        formData.append('message', message);
        formData.append('subject', subject);
        formData.append('allowProjectSupport', `${allowProjectSupport}`);

        screenshots.forEach(file => {
            formData.append('screenshots', file, file.name);
        });

        return firstValueFrom(
            this.httpClient.post(`${this.baseApiUrl}/support/request`, formData, {
                headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` }
            })
        );
    }
}
