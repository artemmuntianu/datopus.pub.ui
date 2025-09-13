import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-is-restricted',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule],
    templateUrl: './is-restricted.component.html',
    styleUrl: './is-restricted.component.scss'
})
export class IsRestrictedComponent {}