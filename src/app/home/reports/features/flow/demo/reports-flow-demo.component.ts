import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { DateRange } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import {
    DEFAULT_DATE_OPTION_ENUM,
    ISelectDateOption,
    NgDatePickerComponent,
    NgDatePickerModule,
    SelectedDateEvent
} from 'ng-material-date-range-picker';
import { NgScrollbarModule } from 'ngx-scrollbar';
import * as Utils from '../../../../../../utilities';

import { ToastrService } from 'ngx-toastr';
import { UserMessages } from '../../../../../consts';
import { User, Org, PartnerOrg, DimValues } from '../../../../../services/api/models';
import { ReportsFeaturesFlowService } from '../../../../../services/api/reports-features-flow.service';
import { SupabaseService } from '../../../../../services/supabase/supabase.service';
import { BreadcrumbService } from '../../../../../common/breadcrumbs/breadcrumb.service';

interface IStatsEntry {
    date: Date;
    datasource_id: number;
    source_feature: string;
    feature: string;
    partner_org?: string;
    dim1?: string;
    dim2?: string;
    dim3?: string;
    dim4?: string;
    dim5?: string;
    dim6?: string;
    dim7?: string;
    dim8?: string;
    dim9?: string;
    dim10?: string;
    actions?: number;
    sessions?: number;
    users?: number;
}

@Component({
    selector: 'app-reports-flow-demo',
    standalone: true,
    imports: [
        MatSidenavModule,
        MatIcon,
        MatCardModule,
        NgScrollbarModule,
        MatDividerModule,
        MatButtonModule,
        MatOptionModule,
        MatSelectModule,
        FormsModule,
        NgDatePickerModule,
        CommonModule
    ],
    templateUrl: './reports-flow-demo.component.html',
    styleUrl: './reports-flow-demo.component.scss'
})
export class ReportsFlowDemoComponent {
    @ViewChild(MatDrawer) drawer: MatDrawer;
    @ViewChild(NgDatePickerComponent) dateRangePicker: NgDatePickerComponent;

    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

    user = User.current!;
    data = {
        org: <Org>{},
        stats: <IStatsEntry[]>[],
        partnerOrgs: <PartnerOrg[]>[],
        dims: <{ [key: string]: DimValues }>{}
    };
    selectedPartnerOrgs: string[] = [];
    selectedDims: { [key: string]: string[] } = {};
    selectedDiagramMetric: string = 'actions';
    selectedDateRange: DateRange<Date> = new DateRange(
        new Date('2024-08-01'),
        new Date('2024-08-08')
    );
    isAlertVisible = {
        reportExplanation: true,
        filtersRequired: false
    };

    constructor(
        private reportsFeaturesFlowService: ReportsFeaturesFlowService,
        private sbService: SupabaseService,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService
    ) {}

    async ngOnInit() {
        this.breadcrumbService.setHeaderBreadcrumb( ['Feature Reports', 'Flow']);
        await Utils.forkByOrgType(
            this.user.orgType,
            async () => {
                const resp = await this.sbService.getPartnerOrgs(this.user.orgId);
                if (resp.error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.partnerOrgs = resp.data;
            },
            async () => {
                const resp = await this.sbService.getOrg(this.user.orgId);
                if (resp.error) {
                    this.toastr.error(UserMessages.technicalIssue);
                    return;
                }
                this.data.org = <any>resp.data[0];
            }
        );

        const resp2 = await this.reportsFeaturesFlowService.getDimsAndValues(this.user.orgId);
        if (resp2.error) {
            this.toastr.error(UserMessages.technicalIssue);
            return;
        }

        this.data.dims = resp2.data.reduce((acc: any, cur) => {
            acc[cur.col_name] = {
                ui_name: cur.ui_name,
                col_name: cur.col_name,
                values: cur.dimension_value.flatMap(x => x.value)
            };
            return acc;
        }, {});

        const toDate = this.selectedDateRange.end!;
        const _30DaysAgo = new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const apiColumnNamesForQuery = this.getColumnNames();
        this.data.stats = <any>(
            await this.reportsFeaturesFlowService.getStats(
                _30DaysAgo,
                toDate,
                this.getDatasourceIds(),
                apiColumnNamesForQuery,
                this.selectedDiagramMetric
            )
        );

        if (apiColumnNamesForQuery.indexOf('datasource_id') > -1)
            for (let statsElem of this.data.stats)
                statsElem.partner_org = this.data.partnerOrgs.find(
                    x => x.datasource_id == statsElem.datasource_id
                )!.name;

        this.initData();
    }

    ngOnDestroy() {
        this.breadcrumbService.resetHeaderBreadcrumb();
    }

    onBtnClick_ShowHideSettingsPane() {
        this.drawer.toggle();
    }

    onDateRangeChanged(event: SelectedDateEvent) {
        this.selectedDateRange = event.range!;
        this.onFilterChanged();
    }

    dateListOptions(optionList: ISelectDateOption[]) {
        optionList.forEach(option => {
            if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM) {
                option.isSelected = true;
            } else {
                option.isSelected = false;
            }
        });
    }

    async onFilterChanged() {
        const apiColumnNamesForQuery = this.getColumnNames();
        this.data.stats = <any>(
            await this.reportsFeaturesFlowService.getStats(
                this.selectedDateRange.start!,
                this.selectedDateRange.end!,
                this.getDatasourceIds(this.selectedPartnerOrgs),
                apiColumnNamesForQuery,
                this.selectedDiagramMetric,
                this.selectedDims
            )
        );
        if (apiColumnNamesForQuery.indexOf('datasource_id') > -1)
            for (let statsElem of this.data.stats)
                statsElem.partner_org = this.data.partnerOrgs.find(
                    x => x.datasource_id == statsElem.datasource_id
                )!.name;

        this.setData();
    }

    async onDiagramMetricChanged() {
        this.isAlertVisible.filtersRequired = ['users', 'sessions'].includes(
            this.selectedDiagramMetric
        );
        await this.onFilterChanged();
    }

    initData() {
        this.createSankey(this.data.stats, this.selectedDiagramMetric);
    }

    setData() {
        d3.selectAll('figure#sankey *').remove();
        this.createSankey(this.data.stats, this.selectedDiagramMetric);
    }

    getDatasourceIds(partnerOrgs?: string[]) {
        return Utils.forkByOrgType(
            this.user.orgType,
            () => {
                if (partnerOrgs && partnerOrgs.length > 0)
                    return this.data.partnerOrgs
                        .filter(x => partnerOrgs.indexOf(x.name) > -1)
                        .map(x => x.datasource_id);

                return <number[]>this.data.partnerOrgs.map(x => x.datasource_id);
            },
            () => {
                return [this.data.org.datasource_id];
            }
        );
    }

    getColumnNames() {
        const res = ['date', 'source_feature', 'feature'];

        if (this.selectedPartnerOrgs.length) res.push('datasource_id');

        if (this.selectedDims)
            for (let propName in this.selectedDims)
                if (this.selectedDims[propName].length) res.push(propName);

        return res;
    }

    private createSankey(stats: IStatsEntry[], metric: string) {
        const formatPercentage = d3.format('.2~%');
        const nodeWidth = 60;
        const nodePadding = 60;
        const fontSize = 14;
        const widthPx = document.body.clientWidth;
        const heightPx = document.body.clientHeight;
        const selectedDiagramMetricUI = Utils.capitalize(this.selectedDiagramMetric);

        this.svg = <any>(
            d3
                .select('figure#sankey')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr(
                    'style',
                    `max-width: 100%; height: auto; font: 300 ${fontSize}pt 'Outfit', sans-serif;`
                )
                .attr('viewBox', [0, 0, widthPx, heightPx])
        );

        const sankey = d3Sankey
            .sankey()
            .nodeId((d: any) => d.name)
            .nodeAlign(d3Sankey.sankeyLeft)
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .nodeSort((a, b) => b.value! - a.value!)
            .extent([
                [0, fontSize + fontSize * 2],
                [widthPx, heightPx]
            ]);

        const nodesAndLinksData = this.getNodesAndLinksData(stats, metric);

        const { nodes, links } = sankey({
            nodes: <any>nodesAndLinksData.nodes,
            links: <any>nodesAndLinksData.links
        });

        const rect = this.svg
            .append('g')
            .selectAll()
            .data(nodes)
            .join('rect')
            .attr('x', (d: any) => d.x0)
            .attr('y', (d: any) => d.y0)
            .attr('height', (d: any) => d.y1 - d.y0)
            .attr('width', (d: any) => d.x1 - d.x0)
            .attr('fill', '#295f98')
            .attr('class', 'node')
            .on('mouseover', this.showLinks)
            .on('mouseout', this.hideLinks);

        rect.append('title').text(
            (d: any) => `${d.name}\n${d.value.toLocaleString()} ${selectedDiagramMetricUI}`
        );

        const link = this.svg
            .append('g')
            .attr('fill', 'none')
            .selectAll()
            .data(links)
            .join('g')
            .attr('stroke-width', (d: any) => Math.max(1, d.width))
            .attr('class', 'link');

        link.append('path').attr('d', d3Sankey.sankeyLinkHorizontal());

        link.append('title').text(
            (d: any) =>
                `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()} ${selectedDiagramMetricUI}`
        );

        const totalValue = nodes.reduce((a, b) => (b.depth == 0 ? a + b.value! : a), 0);
        const textElems = this.svg
            .append('g')
            .selectAll()
            .data(nodes)
            .join('text')
            .attr('x', (d: any) => (d.x0 < widthPx / 2 ? d.x0 : d.x1))
            .attr('y', (d: any) => d.y0 - fontSize * 2)
            .attr('text-anchor', (d: any) => (d.x0 < widthPx / 2 ? 'start' : 'end'));

        textElems
            .append('tspan')
            .attr('x', (d: any) => (d.x0 < widthPx / 2 ? d.x0 : d.x1))
            .attr('dy', 0)
            .text((d: any) => (d.name.length >= 30 ? d.name.substring(0, 28) + '...' : d.name));

        textElems
            .append('tspan')
            .attr('x', (d: any) => (d.x0 < widthPx / 2 ? d.x0 : d.x1))
            .attr('dy', fontSize * 1.5)
            .text((d: any) => formatPercentage(d.value / totalValue));
    }

    private showLinks(d: any) {
        d = d.target.__data__;
        const linkedNodes: any = [];

        const traverse = [
            {
                linkType: 'sourceLinks',
                nodeType: 'target'
            },
            {
                linkType: 'targetLinks',
                nodeType: 'source'
            }
        ];

        traverse.forEach(step => {
            d[step.linkType].forEach((l: any) => {
                linkedNodes.push(l[step.nodeType]);
            });
        });

        d3.selectAll('figure#sankey rect').style('opacity', (r: any) =>
            linkedNodes.find((remainingNode: any) => remainingNode.name === r.name) ? '1' : '0.1'
        );
        d3.select(<any>this).style('opacity', '1');
        d3.selectAll('figure#sankey path').style('opacity', (p: any) =>
            p && (p.source.name === d.name || p.target.name === d.name) ? '1' : '0.1'
        );
    }

    private hideLinks() {
        d3.selectAll('figure#sankey rect').style('opacity', '1');
        d3.selectAll('figure#sankey path').style('opacity', '1');
    }

    private getNodesAndLinksData(stats: IStatsEntry[], metric: string) {
        const links = <{ source: string; target: string; value: number }[]>Object.values(
            stats.reduce((_links: any, entry: IStatsEntry) => {
                const sourceFeatureName = entry.source_feature.length
                    ? entry.source_feature
                    : '$web';
                const linkName = `${sourceFeatureName}-${entry.feature}`;
                let link = _links[linkName];
                if (link === undefined) {
                    _links[linkName] = {
                        source: sourceFeatureName,
                        target: entry.feature,
                        value: 0
                    };
                    link = _links[linkName];
                }
                link.value += +(<any>entry)[metric];
                return _links;
            }, {})
        );
        /* CIRCULAR LINKS */
        this.detectAndRenameCircularLinks(links);
        /* END */
        const allNodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), name => ({
            name
        }));
        allNodes.sort((a, b) => a.name.localeCompare(b.name));
        return { nodes: allNodes, links };
    }

    detectAndRenameCircularLinks(links: { source: string; target: string; value: number }[]) {
        const visited = new Set();

        const rec = (node: string) => {
            if (visited.has(node)) {
                return 'exists'; // Circular link detected
            }
            visited.add(node);

            for (const neighbor of links.filter(link => link.source === node)) {
                if (rec(neighbor.target) == 'exists')
                    // Rename target of the circular link
                    neighbor.target = `⇦ ${neighbor.target}`;
            }
            visited.delete(node);

            return '';
        };

        for (const link of links) {
            rec(link.source);
        }
    }
}
