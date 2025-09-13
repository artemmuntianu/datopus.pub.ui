import { bootstrapApplication } from '@angular/platform-browser';
import posthog from 'posthog-js';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

posthog.init(
    'phc_D2NEkIa71ZFQmRSoZ92KOaSswcnqgKmdv7C4v4BTjq2',
    {
        api_host: 'https://us.i.posthog.com',
        person_profiles: 'always',
        capture_pageview: false,
        capture_pageleave: true
    }
)

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));