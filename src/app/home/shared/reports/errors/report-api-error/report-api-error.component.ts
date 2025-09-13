import { Component, inject, input } from '@angular/core';
import { RedirectPlaceholderComponent } from '../../../../../common/redirect-placeholder/redirect-placeholder.component';
import { Router } from '@angular/router';
import { ReportApiError, ReportApiErrorCode } from '../../../../../store/reports/report-api-error';

@Component({
    selector: 'app-report-api-error',
    templateUrl: './report-api-error.component.html',
    styleUrl: './report-api-error.component.scss',
    standalone: true,
    imports: [RedirectPlaceholderComponent]
})
export class ReportApiErrorComponent {
    router = inject(Router);
    error = input.required<ReportApiError>();

    reportApiErrorCode = ReportApiErrorCode;
    currentPath: string = '';

    constructor() {
        this.currentPath = this.router.url;
    }
}
