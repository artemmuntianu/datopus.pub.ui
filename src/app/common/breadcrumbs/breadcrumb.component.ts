import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-breadcrumb',
    standalone: true,
    imports: [MatMenuModule, MatButtonModule, CommonModule, CdkPortalOutlet, MatTooltipModule],
    templateUrl: './breadcrumb.component.html',
    styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
    @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet: CdkPortalOutlet;

    path = input.required<string[]>();
    description = input<string>();
}
