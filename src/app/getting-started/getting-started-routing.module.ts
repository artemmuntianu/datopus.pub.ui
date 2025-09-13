import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectAnalyticsComponent } from './connect-analytics/connect-analytics.component';
import { ConnectBigQueryComponent } from './connect-bigquery/connect-bigquery.component';
import { LinkBigQueryComponent } from './link-bigquery/link-bigquery.component';
import { SetupAnalyticsComponent } from './setup-analytics/setup-analytics.component';
import { SetupBigQueryComponent } from './setup-bigquery/setup-bigquery.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'setup-analytics',
                component: SetupAnalyticsComponent,
                data: { title: 'Setup Analytics', stepId: 'setup-analytics' }
            },
            {
                path: 'setup-bigquery',
                component: SetupBigQueryComponent,
                data: { title: 'Setup BigQuery', stepId: 'setup-bigquery' }
            },
            {
                path: 'link-bigquery',
                component: LinkBigQueryComponent,
                data: { title: 'Link BigQuery', stepId: 'link-bigquery' }
            },
            {
                path: 'connect-analytics',
                component: ConnectAnalyticsComponent,
                data: { title: 'Connect Analytics', stepId: 'connect-analytics' }
            },
            {
                path: 'connect-bigquery',
                component: ConnectBigQueryComponent,
                data: { title: 'Connect BigQuery', stepId: 'connect-bigquery' }
            },
            {
                path: '',
                redirectTo: 'setup-analytics',
                pathMatch: 'full'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GettingStartedRoutingModule { } 