import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OnboardingService } from '../services/onboarding/onboarding.service';
import { OnboardingStateService } from '../services/onboarding/onboarding-state.service';
import { User } from '../services/api/models/user';

export interface GettingStartedStep {
    id: string;
    title: string;
    completed: boolean;
    route: string;
}

@Injectable({
    providedIn: 'root'
})
export class GettingStartedService {
    private steps: GettingStartedStep[] = [
        { id: 'signup', title: 'Sign up', completed: true, route: '/getting-started/signup' },
        { id: 'setup-analytics', title: 'Setup Analytics', completed: false, route: '/getting-started/setup-analytics' },
        { id: 'setup-bigquery', title: 'Setup BigQuery', completed: false, route: '/getting-started/setup-bigquery' },
        { id: 'link-bigquery', title: 'Link BigQuery', completed: false, route: '/getting-started/link-bigquery' },
        { id: 'connect-analytics', title: 'Connect Analytics', completed: false, route: '/getting-started/connect-analytics' },
        { id: 'connect-bigquery', title: 'Connect BigQuery', completed: false, route: '/getting-started/connect-bigquery' }
    ];

    private progressSubject = new BehaviorSubject<number>(0);
    progress$ = this.progressSubject.asObservable();

    constructor(
        private onboardingService: OnboardingService,
        private onboardingStateService: OnboardingStateService
    ) {
        this.calculateProgress();
    }

    getSteps(): GettingStartedStep[] {
        return this.steps;
    }

    async completeStep(stepId: string) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
            this.calculateProgress();

            // Save to database
            try {
                await this.onboardingService.completeStep(stepId);
                // Refresh onboarding state to update sidebar
                await this.onboardingStateService.initialize(User.current!.orgId);
            } catch (error) {
                console.error('Failed to save step completion to database:', error);
                // Revert local state if database update fails
                step.completed = false;
                this.calculateProgress();
            }
        }
    }

    private calculateProgress() {
        const completedSteps = this.steps.filter(step => step.completed).length;
        const progress = (completedSteps / this.steps.length) * 100;
        this.progressSubject.next(progress);
    }
} 