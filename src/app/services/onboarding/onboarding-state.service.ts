import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OnboardingService } from './onboarding.service';
import { Database } from '../../../../database.types';

@Injectable({
    providedIn: 'root'
})
export class OnboardingStateService {
    private showGettingStartedSubject = new BehaviorSubject<boolean>(false);
    private completedStepsSubject = new BehaviorSubject<string[]>([]);
    private progressSubject = new BehaviorSubject<number>(0);

    showGettingStarted$ = this.showGettingStartedSubject.asObservable();
    completedSteps$ = this.completedStepsSubject.asObservable();
    progress$ = this.progressSubject.asObservable();

    constructor(private onboardingService: OnboardingService) { }

    async initialize(orgId: number): Promise<void> {
        try {
            const progress = await this.onboardingService.getProgress(orgId);
            if (progress) {
                this.updateState(progress);
            }
        } catch (error) {
            console.error('Failed to initialize onboarding state:', error);
        }
    }

    private updateState(progress: Database['public']['Tables']['onboarding_progress']['Row']): void {
        const shouldShow = this.onboardingService.shouldShowGettingStarted(progress);
        const completedSteps = this.onboardingService.getCompletedSteps(progress);
        const progressPercentage = this.onboardingService.calculateProgress(progress);

        this.showGettingStartedSubject.next(shouldShow);
        this.completedStepsSubject.next(completedSteps);
        this.progressSubject.next(progressPercentage);
    }
} 