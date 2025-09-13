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
import { UserMessages } from '../../../consts';
import { ToastrService } from 'ngx-toastr';

export interface IInsightsTableElement {
    text: string;
    date: Date;
}

@Component({
    selector: 'app-insights-tile',
    standalone: true,
    imports: [
        MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatTableModule,
        MatSortModule, ShortNumberPipe, RouterModule
    ],
    templateUrl: './insights-tile.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsightsTileComponent {

    @ViewChild(MatSort) sort: MatSort;

    user: User = User.current!;
    data: any = {};
    dataSource = new MatTableDataSource<IInsightsTableElement>([]);

    constructor(private dashboardService: DashboardService, private toastr: ToastrService) { }

    async ngOnInit() {
        const toDate = new Date(2024, 8 - 1, 8);
        const _7DaysAgo = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const resp1 = await this.dashboardService.getInsights(_7DaysAgo, toDate, this.user.orgId);
        if (resp1.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.insights = resp1.data;

        this.initData();
    }

    initData() {
        this.dataSource.data = this.data.insights;
        this.dataSource.sort = this.sort;
    }

}