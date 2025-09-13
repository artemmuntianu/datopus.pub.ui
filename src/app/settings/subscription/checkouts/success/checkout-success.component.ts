import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CheckoutService } from '../../api/services/checkout.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VerifySubscriptionSessionResponse } from '../../api/models/verify-session.response';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../services/api/auth.service';

@Component({
    standalone: true,
    selector: 'app-settings-subscription-checkout-success',
    templateUrl: './checkout-success.component.html',
    styleUrl: './checkout-success.component.scss',
    imports: [MatProgressSpinnerModule, MatButtonModule, RouterLink]
})
export class SubscriptionCheckoutSuccess {
    route = inject(ActivatedRoute);
    authService = inject(AuthService);
    checkoutService = inject(CheckoutService);
    http = inject(HttpClient);
    router = inject(Router);
    layout = signal<'veryfying_subscription' | 'success' | 'error'>("veryfying_subscription") 
    error: string | null;
    verifySubscriptionSessionResponse = signal<VerifySubscriptionSessionResponse | null>(null);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const sessionId = params['session_id'];
            if (sessionId) {
                this.verifyPayment(sessionId);
            } else {
                this.layout.set("error");
                this.error = "Session id is not found"; 
            }
        });
    }

    verifyPayment(sessionId: string) {
        this.checkoutService.verifyPayment(sessionId).pipe().subscribe({
            next: (response) => {
                this.verifySubscriptionSessionResponse.set(response);
                this.layout.set('success');
                this.authService.sbService.client.auth.refreshSession();
            },
            error: (response: HttpErrorResponse) => {
                this.layout.set('error');
                this.error = response.error.detail;
                this.authService.sbService.client.auth.refreshSession();
            },
        });
    }
}
