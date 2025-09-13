import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { LockContentService } from '../../services/lock-content.service';

@Component({
    selector: 'app-sidebar-submenu-link',
    template: `
        @if (isLocked) {
            <a class="sidemenu-link locked">
                {{ title }}
                <i class="material-symbols-outlined lock">lock</i>
            </a>
        } @else {
            <a
                [routerLink]="route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="sidemenu-link"
            >
                {{ title }}
            </a>
        }
    `,
    styles: [
        `
            .sidemenu-link.locked {
                cursor: default;
            }

            .sidemenu-link.locked i.lock {
                transform: translateY(-25%);
                position: relative;
                font-size: 15px;
                color: orange;
            }
            .sidemenu-link {
                display: block;
                font-size: 15px;
                position: relative;
                border-radius: 5px;
                color: var(--blackColor);
                transition: var(--transition);

                padding: {
                    bottom: 10.4px;
                    top: 10.4px;
                    left: 10px;
                }

                &:hover,
                &.active {
                    background-color: #e7effd;
                    color: var(--daxaColor);
                }
            }
        `
    ],
    standalone: true,
    imports: [MatIconModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarSubMenuLinkComponent {
    @Input() route: string;
    @Input() title: string;

    isLocked: boolean;

    private lockContentService = inject(LockContentService);

    ngOnInit() {
        this.isLocked = this.lockContentService.isLocked(this.route);
    }
}
