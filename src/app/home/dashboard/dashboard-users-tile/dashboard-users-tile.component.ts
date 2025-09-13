import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink, RouterModule } from '@angular/router';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';
import { DashboardService } from '../../../services/api/dashboard.service';
import { User } from '../../../services/api/models/user';

export interface IUsersTableElement {
    email: string;
    signins: number;
}

@Component({
    selector: 'app-dashboard-users-tile',
    standalone: true,
    imports: [
        MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatTableModule,
        MatSortModule, ShortNumberPipe, RouterModule
    ],
    templateUrl: './dashboard-users-tile.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardUsersTileComponent {

    @ViewChild(MatSort) sort: MatSort;

    user: User = User.current!;
    data: any = {};
    dataSource = new MatTableDataSource<IUsersTableElement>([]);

    constructor(private dashboardService: DashboardService) { }

    async ngOnInit() {
        const toDate = new Date(2024, 8 - 1, 8);
        const _7DaysAgo = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const resp2 = await this.dashboardService.getDashboardUsers(_7DaysAgo, toDate, this.user.orgId);

        this.data.users = resp2;

        this.initData();
    }

    initData() {
        this.dataSource.data = this.data.users;
        this.dataSource.sort = this.sort;
    }

}