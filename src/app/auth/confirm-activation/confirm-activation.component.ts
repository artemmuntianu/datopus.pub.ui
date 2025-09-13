import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-confirm-activation',
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule],
    templateUrl: './confirm-activation.component.html',
    styleUrl: './confirm-activation.component.scss'
})
export class ConfirmActivationComponent {

    layout: 'success' | 'error';
    error: string | null;

    constructor() {
        const queryParams = new URLSearchParams(window.location.search);
        this.error = queryParams.get('err');
        this.layout = this.error ? 'error' : 'success';
    }

}