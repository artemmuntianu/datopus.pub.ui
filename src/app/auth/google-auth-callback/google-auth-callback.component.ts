import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-google-auth-callback',
    templateUrl: './google-auth-callback.component.html'
})
export class GoogleAuthCallback {
    ngOnInit() {
        const urlParams = new URLSearchParams(document.location.search);
        const paramsObject = Object.fromEntries(urlParams.entries());

        window.opener?.postMessage(paramsObject, window.origin);
        window.close();
    }
}
