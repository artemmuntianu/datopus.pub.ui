import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStore } from '../../../../store/dashboard/dashboard.store';

@Component({
    selector: 'app-empty-dashboard',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mat-card
            class="daxa-card empty-dashboard-card mb-25 pt-0 border-radius bg-white border-none d-flex justify-content-center align-items-center text-center"
        >
            <mat-card-content>
                <mat-icon class="text-warning">warning</mat-icon>
                <h3>No tiles yet</h3>
                @if (dashboardStore.settings.layoutMode() === 'view') {
                    <p class="text-muted">Start by adding tiles to customize your dashboard.</p>
                    <button mat-flat-button class="daxa" (click)="addTile.emit()">
                        <div class="d-flex justify-content-center align-items-center g-5">
                            <mat-icon>add</mat-icon>
                            <span>Add Tile</span>
                        </div>
                    </button>
                }
            </mat-card-content>
        </mat-card>
    `,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            .empty-dashboard-card {
                width: 50%;
                height: 50%;
                margin: 40px auto;
                padding: 20px;
            }
        `
    ]
})
export default class EmptyDashboardComponent {
    dashboardStore = inject(DashboardStore);
    addTile = output();
}
