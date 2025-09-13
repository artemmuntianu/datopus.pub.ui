import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { LockContentService } from '../../services/lock-content.service';

@Component({
    selector: 'app-sidebar-menu-link',
    template: `
        @if (isLocked) {
            <a class="sidebar-menu-link locked">
                <i class="material-symbols-outlined">{{icon}}</i>
                <span>
                    {{title}}
                    <i class="material-symbols-outlined lock">lock</i>
                </span>
            </a>
        } @else {
            <a [routerLink]="route" routerLinkActive="active" class="sidebar-menu-link">
                <i class="material-symbols-outlined">{{icon}}</i>
                <span>
                    {{title}}
                </span>
            </a>
        }
    `,
    styles: [`
        .sidebar-menu-link.locked {
            cursor: default;
        }

        .sidebar-menu-link.locked i.lock {
            transform: translateY(-25%);
            position: relative;
            font-size: 15px;
            color: orange;
        }
    `],
    standalone: true,
    imports: [MatIconModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarMenuLinkComponent {

    @Input() route: string;
    @Input() icon: string;
    @Input() title: string;

    isLocked: boolean;

    private lockContentService = inject(LockContentService);

    ngOnInit() {
        this.isLocked = this.lockContentService.isLocked(this.route);
    }

}