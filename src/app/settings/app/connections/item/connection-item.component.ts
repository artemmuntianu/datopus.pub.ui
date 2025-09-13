import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-connection-item',
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './connection-item.component.html',
    styleUrls: ['./connection-item.component.scss'],
})
export class ConnectionItemComponent {
    icon = input.required<string>();
    title = input.required<string>();
    properties = input.required<{key: string, value: string}[]>();
    authStep = input.required<string>();
    authStepCondition = input.required<string>();
    setupLink = input.required<string>();

    disconnectClick = output<void>();

    onDisconnect() {
        this.disconnectClick.emit();
    }
}
