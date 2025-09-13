import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Tile } from '../../dashboard/dashboard.model';
import { UpperCasePipe } from '@angular/common';
import { DashboardStore } from '../../../../store/dashboard/dashboard.store';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-tile-header',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, MatButtonModule, UpperCasePipe, MatTooltipModule, MatMenuModule],
    template: `
        <div
            class="d-flex justify-content-between align-items-center cursor-move mb-3 p-10"
            [style.--mdc-icon-button-icon-color]="data().color ?? 'inherit'"
        >
            <div class="d-flex g-5 align-items-center justify-content-center">
                @if (store.settings.layoutMode() === 'edit') {
                    <span class="material-symbols-outlined cursor-pointer">drag_indicator</span>
                }

                <div class="d-flex g-5 align-items-start justify-content-center flex-column">
                    <h6 class="fw-normal mb-0" style="font-size: 0.8rem">
                        {{ data().header.title | uppercase }}
                    </h6>
                    <div class="d-flex align-items-center g-2">
                        <h5 class="mb-0">{{ data().header.subTitle }}</h5>
                        @if (data().description; as titleTooltip) {
                            <i
                                class="material-symbols-outlined tile-description-tooltip-icon"
                                [matTooltip]="titleTooltip"
                                matTooltipPosition="above"
                            >
                                info
                            </i>
                        }
                    </div>
                </div>
            </div>

            <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="editTile.emit()">
                    <mat-icon class="text-d">design_services</mat-icon>
                    <span>Edit</span>
                </button>
                <button mat-menu-item (click)="rename.emit()">
                    <mat-icon class="text-d">edit</mat-icon>
                    <span>Rename</span>
                </button>
                <button mat-menu-item (click)="changeTileDescription.emit()">
                    <mat-icon class="text-d">edit_note</mat-icon>
                    <span>Change description</span>
                </button>
                <button mat-menu-item (click)="removeTile.emit()">
                    <mat-icon class="text-danger">delete</mat-icon>
                    <span>Delete tile</span>
                </button>
            </mat-menu>
        </div>
    `,
    styles: `
        .tile-description-tooltip-icon {
            font-size: 1rem;
            cursor: pointer;
        }
    `
})
export class TileHeaderComponent {
    data = input.required<Tile>();
    editTile = output();
    changeTileDescription = output();
    rename = output();
    removeTile = output();
    store = inject(DashboardStore);
}
