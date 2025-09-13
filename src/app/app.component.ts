import { CommonModule, NgClass, ViewportScroller } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthSession } from '@supabase/supabase-js';
import posthog from 'posthog-js';
import { HeaderComponent } from './common/header/header.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { OrgType, SubscriptionType, UserRole } from './enums';
import { DemoUseCasesComponent } from './pages/demo-use-cases/demo-use-cases.component';
import { AuthService } from './services/api/auth.service';
import { User } from './services/api/models/user';
import { UserService } from './services/api/user.service';
import { OnboardingStateService } from './services/onboarding/onboarding-state.service';

declare const gtag: any;

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        CommonModule,
        SidebarComponent,
        HeaderComponent,
        NgClass,
        DemoUseCasesComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    @ViewChild('mainContent') mainContent: ElementRef;

    contentTopPadding = 10;
    session: AuthSession | null;
    layout: 'default' | 'page';

    constructor(
        public router: Router,
        private viewportScroller: ViewportScroller,
        private authService: AuthService,
        private userService: UserService,
        private renderer: Renderer2,
        private onboardingStateService: OnboardingStateService
    ) {
        const urlForNotLoggedIn = '/auth';

        if (
            window.location.pathname.includes('/demo-use-cases') ||
            window.location.pathname.includes('/auth')
        ) {
            this.layout = 'page';
            gtag('config', 'G-J7GNGDW9RR');
        } else {
            this.layout = 'default';
            this.authService.onAuthStateChange((_, session) => {
                if (session) {
                    const u = session.user;
                    User.current = {
                        id: u.id,
                        version: '1.0',
                        full_name: u.user_metadata['full_name'],
                        picture: u.user_metadata['picture'],
                        phone: u.user_metadata['phone'],
                        social_profiles: u.user_metadata['social_profiles'],
                        email: u.email,
                        role: <UserRole>u.app_metadata['role'],
                        orgId: <number>u.app_metadata['orgId'],
                        orgType: <OrgType>u.app_metadata['orgType'],
                        orgSubscription: <SubscriptionType>u.app_metadata['orgSubscription'],
                        partnerOrgId: <number>u.app_metadata['partnerOrgId']
                    };
                    gtag('config', 'G-J7GNGDW9RR', {
                        user_id: User.current!.id,
                        user_properties: {
                            user_role: User.current!.role
                        }
                    });
                } else {
                    User.current = null;
                    window.location.pathname = urlForNotLoggedIn;
                }
                this.userService.setUser(User.current);
                this.session = session;
            }); // should be executed immediately after service instantiated
        }

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                posthog.capture('$pageview');
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
    }

    async ngOnInit() {
        const user = User.current;
        if (user) {
            await this.onboardingStateService.initialize(user.orgId);
        }
    }

    updateContentPadding(headerSize: {
        offsetTop: number;
        offsetHeight: number;
        offsetWidth: number;
    }) {
        this.renderer.setStyle(
            this.mainContent.nativeElement,
            'paddingTop',
            `${headerSize.offsetHeight + headerSize.offsetTop + this.contentTopPadding}px`
        );
    }
}
