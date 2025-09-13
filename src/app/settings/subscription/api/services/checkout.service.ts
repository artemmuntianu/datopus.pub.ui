import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';
import { env } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../services/api/auth.service';
import { VerifySubscriptionSessionResponse } from '../../api/models/verify-session.response';
import { PortalSessionResponse } from '../models/portal-session.response';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {
    private authService = inject(AuthService);
    private stripe = loadStripe(env.stripePublicKey);
    private toastrService = inject(ToastrService);

    constructor(private http: HttpClient) {}

    async createPortalSession(action: 'cancel' | 'update') {
        const accessToken = this.authService.getAccessToken();

        if (!accessToken) {
            throw new Error('Error creating portal session: Not authenticated.');
        }

        const session = await firstValueFrom(
            this.http.post<PortalSessionResponse>(
                `${env.apiBaseUrl}/subscriptions/portal-session`,
                { return_path: '/settings/subscription/checkout/portal-return', action },
                { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
            )
        );

        if (session && session.url) {
            window.location.href = session.url;
        } else {
            throw new Error('Error creating portal session: Received response but URL is missing.');
        }
    }

    async createCheckoutSession(priceId: string, quantity: number, currency: string) {
        try {
            const session = await firstValueFrom(
                this.http.post<{ id: string }>(
                    `${env.apiBaseUrl}/subscriptions/checkout-session`,
                    {
                        quantity,
                        price_id: priceId,
                        currency: currency,
                        success_path: '/settings/subscription/checkout/success',
                        cancel_path: '/settings/subscription'
                    },
                    { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                )
            );
            const stripe = await this.stripe;
            if (stripe && session) {
                await stripe.redirectToCheckout({ sessionId: session.id });
            }
        } catch (err) {
            if (err instanceof HttpErrorResponse) {
                if (err.error.detail) {
                    this.toastrService.error(err.error.detail);
                }
            }
            console.error(err);
        }
    }

    verifyPayment(sessionId: string) {
        return this.http.get<VerifySubscriptionSessionResponse>(
            `${env.apiBaseUrl}/subscriptions/checkout-session/verify?session_id=${sessionId}`,
            { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
        );
    }
}
