import { CommonModule, NgClass } from '@angular/common';
import {
    Component,
    ElementRef,
    HostListener,
    output,
    ViewChild,
    inject,
    Signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/api/auth.service';
import { User } from '../../services/api/models/user';
import { UserService } from '../../services/api/user.service';
import { distinctUntilChanged, Observable, Subject, throttleTime } from 'rxjs';
import { UserData } from '../../consts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadcrumbComponent } from '../breadcrumbs/breadcrumb.component';
import { BreadcrumbInfo, BreadcrumbService } from '../breadcrumbs/breadcrumb.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface HeaderOffsetSize {
    offsetHeight: number;
    offsetWidth: number;
    offsetTop: number;
}

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
    NgClass,
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
    BreadcrumbComponent,
    MatTooltipModule,
    MatIconModule
],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {
    @ViewChild('header') header: ElementRef;
    
    breadcrumbService = inject(BreadcrumbService);

    headerSizeChange = output<HeaderOffsetSize>();

    headerSizeEmitSubject = new Subject<HeaderOffsetSize>();

    defaultProfileImageUrl = UserData.defaultProfilePhotoUrl;
    isSticky: boolean = false;
    user$: Observable<User | null>;
    breadCrumbInfo: Signal<BreadcrumbInfo | null>;
    private resizeObserver: ResizeObserver;

    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {
        this.breadCrumbInfo = this.breadcrumbService.getHeaderBreadcrumbSignal();
        
        this.user$ = this.userService.getUser();

        this.headerSizeEmitSubject
            .pipe(
                takeUntilDestroyed(),
                throttleTime(200, undefined, { leading: true, trailing: true }),
                distinctUntilChanged((prev, curr) => {
                    return (
                        prev.offsetHeight === curr.offsetHeight &&
                        prev.offsetTop === curr.offsetTop
                    );
                })
            )
            .subscribe((size) => {
                this.headerSizeChange.emit(size);
            });
    }

    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    async onLogout() {
        const { error } = await this.authService.signOut();
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.headerSizeChange.emit({
            offsetWidth: 0,
            offsetHeight: 0,
            offsetTop: 0,
        });
    }

    ngAfterViewInit(): void {
        this.resizeObserver = new ResizeObserver(() => {
            this.headerSizeEmitSubject.next({
                offsetWidth: this.header.nativeElement.offsetWidth,
                offsetHeight: this.header.nativeElement.offsetHeight,
                offsetTop: this.header.nativeElement.offsetTop,
            });
        });
        this.resizeObserver.observe(this.header.nativeElement);
    }
}
