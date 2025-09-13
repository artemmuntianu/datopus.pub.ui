import { Injectable } from '@angular/core';
import { Database } from '../../../../database.types';
import { User } from '../api/models/user';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class OnboardingService {
    constructor(private supabaseService: SupabaseService) { }

    async getProgress(orgId: number): Promise<Database['public']['Tables']['onboarding_progress']['Row'] | null> {
        const { data, error } = await this.supabaseService.getOnboardingProgress(orgId);

        if (error) {
            console.error('Failed to get onboarding progress:', error);
            return null;
        }

        return data;
    }

    async completeStep(stepId: string): Promise<void> {
        await this.supabaseService.completeOnboardingStep(User.current!.orgId, stepId);
    }

    calculateProgress(progress: Database['public']['Tables']['onboarding_progress']['Row']): number {
        const completedSteps = [
            progress.signup_completed_at,
            progress.setup_analytics_completed_at,
            progress.setup_bigquery_completed_at,
            progress.link_bigquery_completed_at,
            progress.connect_analytics_completed_at,
            progress.connect_bigquery_completed_at
        ].filter(step => step !== null).length;

        return (completedSteps * 100) / 6;
    }

    shouldShowGettingStarted(progress: Database['public']['Tables']['onboarding_progress']['Row']): boolean {
        return this.calculateProgress(progress) < 100;
    }

    getCompletedSteps(progress: Database['public']['Tables']['onboarding_progress']['Row']): string[] {
        const completedSteps: string[] = [];

        if (progress.signup_completed_at) completedSteps.push('signup');
        if (progress.setup_analytics_completed_at) completedSteps.push('setup-analytics');
        if (progress.setup_bigquery_completed_at) completedSteps.push('setup-bigquery');
        if (progress.link_bigquery_completed_at) completedSteps.push('link-bigquery');
        if (progress.connect_analytics_completed_at) completedSteps.push('connect-analytics');
        if (progress.connect_bigquery_completed_at) completedSteps.push('connect-bigquery');

        return completedSteps;
    }
} 