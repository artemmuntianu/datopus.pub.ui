import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LockContentService } from '../../services/lock-content.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sidebar-upgrade-plan',
    template: `
        <button mat-button (click)="onUpgradePlanClick()" class="btn-upgrade-plan">
            <i class="material-symbols-outlined">auto_awesome</i>&nbsp;UPGRADE
        </button>
        <button mat-button matTooltip="Hide all Premium features for 7 days" matTooltipPosition="above" (click)="onChangePremiumFeaturesVisibilityClick()" class="btn-premium-features-visibility d-mini">
            <i class="material-symbols-outlined">
                @if (lockContentService.areLocksVisible()) { visibility } @else { visibility_off }
            </i>
        </button>
    `,
    styles: [`
        :host {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            border-top: 1px solid rgba(0,0,0,.12);
            bottom: 0;
            padding: 10px 0;
            background: #fff;

            .btn-upgrade-plan::ng-deep {
                background: rgb(255, 165, 0);
                color: #fff;
                padding: 5px 30px;

                i {
                    font-size: 20px;
                }

                .mdc-button__label {
                    display: flex;
                    align-items: center;
                }
            }
        }
    `],
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatTooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarUpgradePlanComponent {

    router = inject(Router);
    lockContentService = inject(LockContentService);

    onUpgradePlanClick() {
        this.router.navigateByUrl('settings/subscription/available-plans');
    }

    onChangePremiumFeaturesVisibilityClick() {
        this.lockContentService.setLocksVisibility(!this.lockContentService.areLocksVisible());
    }

}