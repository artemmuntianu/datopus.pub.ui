import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    signal
} from '@angular/core';
import { ReportsBQDataService } from '../../../reports/services/reports-bq-data.service';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import * as Utils from '../../../../../utilities';
import {
    BQFilterDefinition,
    BQMetricDefinition,
    BQStringFilterDefinition,
    ReportDefinition,
    ReportSettings
} from '../../../reports/features/models/reports-definition';
import { HomeTimeService } from '../../services/home-time.service';
import { DateRange } from '../../../../shared/types/date-range';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BQApiError, BQApiErrorCode } from '../../../../services/google/big-query/models/bq-error';
import { ReportsBQApiError } from '../errors/bq-api-error/bq-api-error.component';
import { BQDatasource } from '../../../../services/api/models';
import {
    DIAGRAM_PANNING_ICON,
    DIAGRAM_RESET_ICON,
    DIAGRAM_ZOOM_IN_ICON,
    DIAGRAM_ZOOM_OUT_ICON
} from './diagram-panel-icons/icons';
import {
    BQMatchType,
    BQStringFilter
} from '../../../../services/google/big-query/models/bq-filter';

@Component({
    selector: 'app-reports-diagram',
    styleUrl: './reports-diagram.component.scss',
    templateUrl: './reports-diagram.component.html',
    imports: [MatProgressSpinnerModule, ReportsBQApiError],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ReportsDiagramComponent {
    private dataService = inject(ReportsBQDataService);
    private readonly timeService = inject(HomeTimeService);

    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    selectedDiagramMetric: string = 'actions';
    definition = input.required<ReportDefinition>();
    datasource = input.required<BQDatasource>();

    loading = signal<boolean>(false);
    bqError = signal<BQApiError | null>(null);

    timeRange = this.timeService.getGlobalDateRangeTime();

    sankeySelector = computed(() => {
        return `figure#${this.sankeyId()}`;
    });

    sankeyId = computed(() => {
        return 'sankey' + this.definition().id;
    });

    constructor() {
        effect(
            async () => {
                const config = this.definition();
                const source = this.datasource();

                if (!config?.settings) {
                    return;
                }

                const timeRange = this.timeRange();

                if (!this.shouldLoadTable(config)) return;

                await this.fetchAndLoadTable(source, config.settings, timeRange);
            },
            { allowSignalWrites: true }
        );
    }

    private shouldLoadTable(config: ReportDefinition | null): boolean {
        return !!config && config.settings.selectedVisual.type === 'diagram';
    }

    private async fetchAndLoadTable(
        datasource: BQDatasource,
        settings: ReportSettings,
        dateRange: DateRange
    ) {
        this.loading.set(true);
        this.bqError.set(null);

        let { metricFilter, dimensionFilter, diagramDefinitions, selectedDiagramMetric } = settings;

        let stats: Record<string, string | number>[];
        try {
            // NOTE:
            // We use uneditable dimensions for this query that stored in diagramDefinitions
            // By default they bounded to feature_event
            // if we planning to edit diagram definitions,
            // consider to move this event_name filter into ReportSettings too
            const updatedDimensionFilter = new BQFilterDefinition<'dimension'>('dimension', [
                ...(dimensionFilter?.filterList ?? [])
            ]);

            updatedDimensionFilter.filterList.push(
                new BQStringFilterDefinition(
                    'event_name',
                    false,
                    new BQStringFilter(BQMatchType.MATCH_EXACT, 'feature_event')
                )
            );

            stats = await this.dataService.getStats(datasource, {
                dateRange,
                metrics: [selectedDiagramMetric!],
                dimensions: diagramDefinitions!,
                dimensionFilter: updatedDimensionFilter,
                metricFilter
            });
        } catch (err) {
            if (err instanceof BQApiError) {
                this.bqError.set(err);
            } else {
                console.error(err);
                this.bqError.set(
                    new BQApiError(BQApiErrorCode.UNKNOWN_ERROR, 'An unknown error occured')
                );
            }
            stats = [] as Record<string, string | number>[];
        } finally {
            this.loading.set(false);
        }

        this.createSankey(stats, selectedDiagramMetric);
    }

    private createSankey(stats: Record<string, string | number>[], metric: BQMetricDefinition) {
        d3.select(this.sankeySelector()).select('.sankey-svg-canvas').remove();
        d3.select(this.sankeySelector()).select('.diagram-control-panels').remove();

        if (stats.length === 0) return;

        const formatPercentage = d3.format('.2~%');
        const nodeWidth = 60;
        const nodePadding = 80;
        const fontSize = 14;
        const widthPx = document.body.clientWidth;
        const heightPx = document.body.clientHeight;

        const selectedDiagramMetricUI = Utils.capitalize(metric.uiName);

        this.svg = <any>(
            d3
                .select(this.sankeySelector())
                .style('position', 'relative')
                .append('svg')
                .attr('class', 'sankey-svg-canvas')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr(
                    'style',
                    `max-width: 100%; height: 100%; font: 300 ${fontSize}pt 'Outfit', sans-serif; cursor: move;`
                )
                .attr('viewBox', [0, 0, widthPx, heightPx])
        );

        const zoomGroup = this.svg.append('g');

        const zoom = d3
            .zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', event => {
                zoomGroup.attr('transform', event.transform);
            });

        const controls = d3
            .select(this.sankeySelector())
            .insert('div', ':first-child')
            .attr('class', 'diagram-control-panels')
            .style('position', 'absolute')
            .style('top', '0px')
            .style('right', '3px')
            .style('z-index', '10')
            .style('background', 'rgba(255, 255, 255, 0.5)')
            .style('padding', '0px')
            .style('border-radius', '5px')
            .style('max-width', '150px');

        this.addButton({
            parent: controls,
            iconHTML: DIAGRAM_ZOOM_IN_ICON,
            title: 'Zoom In',
            onClick: () => this.zoomHandler(1.2, zoom),
            className: 'diagram-zoom-in-button'
        });
        this.addButton({
            parent: controls,
            iconHTML: DIAGRAM_ZOOM_OUT_ICON,
            title: 'Zoom Out',
            onClick: () => this.zoomHandler(0.8, zoom),
            className: 'diagram-zoom-out-button'
        });
        this.addButton({
            parent: controls,
            iconHTML: DIAGRAM_PANNING_ICON,
            title: 'Panning',
            className: 'diagram-panning-button'
        });
        this.addButton({
            parent: controls,
            iconHTML: DIAGRAM_RESET_ICON,
            title: 'Zoom Reset',
            onClick: () => this.resetZoom(zoom),
            className: 'diagram-reset-button'
        });

        this.svg.call(zoom as any);

        const sankey = d3Sankey
            .sankey()
            .nodeId((d: any) => d.name)
            .nodeAlign(d3Sankey.sankeyLeft)
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .nodeSort((a, b) => b.value! - a.value!)
            .extent([
                [0, fontSize + fontSize * 2],
                [widthPx * 1.5, heightPx]
            ]);

        const nodesAndLinksData = this.getNodesAndLinksData(stats, metric.apiName);

        const { nodes, links } = sankey({
            nodes: <any>nodesAndLinksData.nodes,
            links: <any>nodesAndLinksData.links
        });

        const self = this;

        const rect = zoomGroup
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
            .on('mouseover', function (d: any) {
                self.showLinks.call(this, d, self.sankeySelector());
            })
            .on('mouseout', this.hideLinks.bind(this));

        rect.append('title').text(
            (d: any) => `${d.name}\n${d.value.toLocaleString()} ${selectedDiagramMetricUI}`
        );

        const link = zoomGroup
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
                `${d.source.name} → ${
                    d.target.name
                }\n${d.value.toLocaleString()} ${selectedDiagramMetricUI}`
        );

        const totalValue = nodes.reduce((a, b) => (b.depth == 0 ? a + b.value! : a), 0);
        const textElems = zoomGroup
            .append('g')
            .selectAll()
            .data(nodes)
            .join('text')
            .attr('x', (d: any) => (d.x0 < widthPx / 2 ? d.x0 : d.x1))
            .attr('y', (d: any) => d.y0 - fontSize * 2)
            .attr('text-anchor', () => 'start');

        textElems
            .append('tspan')
            .attr('x', (d: any) => d.x0)
            .attr('dy', 0)
            .text((d: any) => (d.name.length >= 30 ? d.name.substring(0, 28) + '...' : d.name));

        textElems
            .append('tspan')
            .attr('x', (d: any) => d.x0)
            .attr('dy', fontSize * 1.5)
            .text((d: any) => formatPercentage(d.value / totalValue));
    }

    private addButton({
        parent,
        iconHTML,
        title,
        className,
        onClick
    }: {
        parent: any;
        iconHTML: string;
        title: string;
        className?: string;
        onClick?: () => void;
    }) {
        const button = parent
            .append('button')
            .attr('title', title)
            .attr('class', `diagram-control-button ${className ?? ''}`.trim())
            .style('border', 'none')
            .style('background', 'transparent')
            .style('cursor', 'pointer')
            .html(iconHTML);

        if (onClick) {
            button.on('click', onClick);
        }
    }

    private showLinks(d: any, selector: string) {
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

        d3.selectAll(`${selector} rect`).style('opacity', (r: any) =>
            linkedNodes.find((remainingNode: any) => remainingNode.name === r.name) ? '1' : '0.1'
        );
        d3.select(<any>this).style('opacity', '1');
        d3.selectAll(`${selector} path`).style('opacity', (p: any) =>
            p && (p.source.name === d.name || p.target.name === d.name) ? '1' : '0.1'
        );
    }

    zoomHandler(scaleFactor: number, zoom: any) {
        this.svg.transition().duration(500).call(zoom.scaleBy, scaleFactor);
    }

    resetZoom(zoom: any) {
        this.svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    }

    private hideLinks() {
        d3.selectAll(`${this.sankeySelector()} rect`).style('opacity', '1');
        d3.selectAll(`${this.sankeySelector()} path`).style('opacity', '1');
    }

    private getNodesAndLinksData(stats: Record<string, string | number>[], metric: string) {
        const links = <{ source: string; target: string; value: number }[]>Object.values(
            stats.reduce((_links: any, entry: Record<string, string | number>) => {
                const sourceFeatureName = (entry['prevFeature'] as string).length
                    ? entry['prevFeature']
                    : '$web';
                const linkName = `${sourceFeatureName}-${entry['feature']}`;
                let link = _links[linkName];
                if (link === undefined) {
                    _links[linkName] = {
                        source: sourceFeatureName,
                        target: entry['feature'],
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
