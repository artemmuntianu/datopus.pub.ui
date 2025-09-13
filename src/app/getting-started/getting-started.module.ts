import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GANewConnectionComponent } from '../settings/app/connections/new/google-analytics/ga-new-connection.component';
import { BQNewConnectionComponent } from '../settings/app/connections/new/google-big-query/bq-new-connection.component';
import { GettingStartedPageComponent } from './getting-started-page.component';
import { GettingStartedRoutingModule } from './getting-started-routing.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        GettingStartedRoutingModule,
        GettingStartedPageComponent,
        GANewConnectionComponent,
        BQNewConnectionComponent
    ]
})
export class GettingStartedModule { } 