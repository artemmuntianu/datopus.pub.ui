import { Component, input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-redirect-placeholder',
    templateUrl: 'redirect-placeholder.component.html',
    styleUrl: 'redirect-placeholder.component.scss',
    imports: [RouterLink, MatIcon, MatCard, MatCardContent, MatButtonModule]
})
export class RedirectPlaceholderComponent {
    router = inject(Router);

    reload = input<boolean>(false);
    title = input.required<string>();
    description = input.required<string>();
    linkText = input.required<string>();
    link = input.required<string>();

    reloadComponent() {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([this.link()]);
        });
    }
}
