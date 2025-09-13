import { Component, inject, input } from '@angular/core';
import { BQApiError, BQApiErrorCode } from '../../../../../services/google/big-query/models/bq-error';
import { RedirectPlaceholderComponent } from '../../../../../common/redirect-placeholder/redirect-placeholder.component';
import { Router } from '@angular/router';
import { BQAuthService } from '../../../../../services/google/big-query/bq-auth/bq-auth.service';

@Component({
    selector: 'app-bq-api-error',
    templateUrl: './bq-api-error.component.html',
    styleUrl: './bq-api-error.component.scss',
    standalone: true,
    imports: [RedirectPlaceholderComponent]
})
export class ReportsBQApiError {
    router = inject(Router);
    bqAuthService = inject(BQAuthService);
    error = input.required<BQApiError>();

    BQApiErrorCode = BQApiErrorCode;
    currentPath: string = '';

    constructor() {
        this.currentPath = this.router.url;
    }
}
