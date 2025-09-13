import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { GettingStartedService } from './getting-started.service';

@Component({
    selector: 'app-getting-started-page',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './getting-started-page.component.html',
    styleUrl: './getting-started-page.component.scss'
})
export class GettingStartedPageComponent implements OnInit {
    title!: string;
    stepId!: string;
    showCompleteBtn: boolean = false;

    constructor(
        private gettingStartedService: GettingStartedService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.title = data['title'];
            this.stepId = data['stepId'];
            this.showCompleteBtn = !['connect-analytics', 'connect-bigquery'].includes(this.stepId);
        });
    }

    onDone() {
        this.gettingStartedService.completeStep(this.stepId);
        const steps = this.gettingStartedService.getSteps();
        const currentIndex = steps.findIndex(step => step.id === this.stepId);
        const nextStep = steps[currentIndex + 1];

        if (nextStep) {
            this.router.navigate([nextStep.route]);
        }
    }
} 