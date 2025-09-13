import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../common/breadcrumbs/breadcrumb.service';
import { DashboardStore } from '../store/dashboard/dashboard.store';
import { User } from '../services/api/models';
import { OnboardingStateService } from '../services/onboarding/onboarding-state.service';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        RouterLink
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

    user = User.current!;
    dashboardStore = inject(DashboardStore);
    private breadcrumbService = inject(BreadcrumbService);
    private onboardingStateService = inject(OnboardingStateService);

    showGettingStarted = false;

    constructor() {
        this.breadcrumbService.setHeaderBreadcrumb([]);
    }

    ngOnInit() {
        this.onboardingStateService.showGettingStarted$.subscribe(
            show => this.showGettingStarted = show
        );
    }
}