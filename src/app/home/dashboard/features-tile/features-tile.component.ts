import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink, RouterModule } from '@angular/router';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';
import { DashboardService } from '../../../services/api/dashboard.service';
import { User } from '../../../services/api/models/user';
import { UserMessages } from '../../../consts';
import { ToastrService } from 'ngx-toastr';

export interface IFeatureStatsTableElement {
    feature: string;
    actions: number;
}

@Component({
    selector: 'app-features-tile',
    standalone: true,
    imports: [
        MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatTableModule,
        MatSortModule, ShortNumberPipe, RouterModule
    ],
    templateUrl: './features-tile.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesTileComponent {

    @ViewChild(MatSort) sort: MatSort;

    user: User = User.current!;
    data: any = {};
    dataSource = new MatTableDataSource<IFeatureStatsTableElement>([]);

    constructor(private dashboardService: DashboardService, private toastr: ToastrService) { }

    ngOnInit() {
        this.dataSource.data = [];
        this.dataSource.sort = this.sort;
    }

    async setData(datasourceIds: number[]) {
        const toDate = new Date(2024, 8 - 1, 8);
        const _7DaysAgo = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const resp = await this.dashboardService.getFeatureStats(_7DaysAgo, toDate, datasourceIds);
        if (resp.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.featureStats = resp.data;

        this.dataSource.data = this.data.featureStats;
        this.dataSource.sort = this.sort;
    }

}