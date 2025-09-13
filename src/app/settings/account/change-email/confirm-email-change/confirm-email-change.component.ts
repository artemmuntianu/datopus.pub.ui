import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-confirm-email-change',
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule],
    templateUrl: './confirm-email-change.component.html',
    styleUrl: './confirm-email-change.component.scss',
})
export class ConfirmEmailChangeComponent {
    state: 'inprogress' | 'success' | 'error';
    error: string | null;
    message: string | null;
    oldEmail: string | null;
    newEmail: string | null;

    constructor() {
        const params = this.parseHashParams();

        if (params.message) {
            this.state = 'inprogress';
            this.message = params.message;
        } else if (params.error.errorCode) {
            this.state = 'error';
            this.error = params.error.errorDescription;
        } else {
            this.state = 'success';
        }
    }

    navigateHome() {
        window.location.href = '/';
    }

    parseHashParams() {
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const error = params.get('error');
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');
        const message = params.get('message');
        return {
            message: message,
            error: { name: error, errorCode, errorDescription },
        };
    }
}
