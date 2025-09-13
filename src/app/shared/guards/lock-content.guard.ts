import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { LockContentService } from '../../services/lock-content.service';

@Injectable({
    providedIn: 'root'
})
export class LockContentGuard implements CanActivate {

    private router = inject(Router);
    private lockContentService = inject(LockContentService);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const canActivate = !this.lockContentService.isLocked(state.url);
        if (!canActivate)
            this.router.navigate(['is-restricted']);

        return canActivate;
    }

}