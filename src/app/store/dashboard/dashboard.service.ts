import { Injectable, inject } from '@angular/core';
import { Dashboard, Tile, TileDTO } from '../../home/dashboard-new/dashboard/dashboard.model';
import { NewTile } from '../../home/dashboard-new/tile/tile-dialog/tile-dialog.component';
import {
    ReportDefinition,
    ReportSettings
} from '../../home/reports/features/models/reports-definition';
import { ReportVisualComponent } from '../../home/shared/reports/report-visual.component';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Json } from '../../../../database.types';
import {
    DashboardApiError,
    DashboardApiErrorCode
} from '../../services/api/models/dashboard/error';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    sbService = inject(SupabaseService);

    async fetchDashboards(orgId: number): Promise<Dashboard[]> {
        const { error, data } = await this.sbService.client
            .from('dashboard')
            .select('*')
            .eq('org_id', orgId);

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to fetch list of dashboards',
                error.details
            );
        }

        return data.map(row => {
            return Dashboard.fromApi(row);
        });
    }

    async createDashboard(
        settings: { name: string; description: string },
        orgId: number,
        authorId: string
    ) {
        const { data, error } = await this.sbService.client
            .from('dashboard')
            .insert({
                name: settings.name,
                description: settings.description,
                org_id: orgId,
                author_id: authorId
            })
            .select('*')
            .single();

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to create dashboard',
                error.details
            );
        }
        return Dashboard.fromApi(data);
    }

    async updateDashboard(dashboard: Partial<Dashboard>, dashboardId: number) {
        const { data, error } = await this.sbService.client
            .from('dashboard')
            .update({
                name: dashboard.name ?? undefined,
                author_id: dashboard.authorId ?? undefined,
                description: dashboard.description ?? undefined,
                org_id: dashboard.orgId ?? undefined
            })
            .eq('id', dashboardId)
            .select('*')
            .single();

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to update dashboard',
                error.details
            );
        }
        return Dashboard.fromApi(data);
    }

    async fetchTileById(tileId: number): Promise<Tile> {
        const { data, error } = await this.sbService.client
            .from('dashboard_tile')
            .select('*, dashboard_tile_content(source_type, definition:visual_definition(*))')
            .eq('id', tileId)
            .single();
        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to fetch tile',
                error.details
            );
        }
        return this.mapTile(data);
    }

    async fetchDashboardTiles(dashboardId: number): Promise<Tile[]> {
        const { data, error } = await this.sbService.client
            .from('dashboard')
            .select(
                'dashboard_tile(*,  dashboard_tile_content(source_type, definition:visual_definition(*)))'
            )
            .eq('id', dashboardId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new DashboardApiError(
                    DashboardApiErrorCode.NOT_FOUND,
                    'No dashboard found',
                    error.details
                );
            }
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to fetch tiles',
                error.details
            );
        }
        return data.dashboard_tile.map(this.mapTile.bind(this));
    }

    private mapTile(data: {
        name: string;
        description: string | null;
        background_color: string | null;
        dashboard_id: number;
        height: number;
        id: number;
        x: number;
        y: number;
        width: number;
        dashboard_tile_content: {
            source_type: string;
            definition: {
                created_at: string;
                explanation: string | null;
                id: number;
                org_id: number | null;
                settings: Json;
                system_name: string | null;
            } | null;
        }[];
    }) {
        let content = data.dashboard_tile_content[0];
        let definition = content.definition;

        return {
            width: data.width,
            content: this.getComponentType(content.source_type),
            header: {
                subTitle: data.name,
                title: (definition?.settings as ReportSettings | undefined)?.selectedVisual.type
            },
            x: data.x,
            y: data.y,
            id: data.id,
            backgroundColor: data.background_color,
            height: data.height,
            name: data.name,
            description: data.description,
            inputs: {
                definition: definition ? ReportDefinition.fromApi(definition) : null
            }
        } as Tile;
    }

    getComponentType(source: string) {
        switch (source) {
            case 'report': {
                return ReportVisualComponent;
            }
            default:
                return null;
        }
    }

    async saveNewTileWithContentRPC(dashboardId: number, tile: any, content: any) {
        const { data, error } = await this.sbService.client
            .rpc('add_report_tile_transaction', {
                dashboard_id: dashboardId,
                report_settings: content.settings,
                tile_description: tile.description,
                tile_name: tile.name,
                tile_height: tile.height,
                tile_width: tile.width
            })
            .single();

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to save new tile',
                error.details
            );
        }

        return data;
    }

    // deletes removed tiles
    // insert new tiles
    // or update existing ones
    async upsertTilesRPC(tiles: Tile[], tileIdsToDelete: number[], dashboardId: number) {
        let { error } = await this.sbService.client.rpc('save_tiles_transaction', {
            deleted_tile_ids: tileIdsToDelete,
            new_tiles: tiles.map(tile => ({
                id: tile.id,
                background_color: tile.backgroundColor ?? null,
                x: tile.x,
                y: tile.y,
                name: tile.name,
                description: tile.description ?? null,
                dashboard_id: dashboardId,
                height: tile.height,
                width: tile.width
            }))
        });

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to update tiles',
                error.details
            );
        }
    }

    async updateTile(id: number, tile: Partial<Tile>): Promise<TileDTO> {
        const updateData = Object.fromEntries(
            Object.entries({
                name: tile.name,
                background_color: tile.backgroundColor,
                description: tile.description,
                height: tile.height,
                width: tile.width,
                x: tile.x,
                y: tile.y
            }).filter(([_, value]) => value !== undefined)
        );

        const { data, error } = await this.sbService.client
            .from('dashboard_tile')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to update tile',
                error.details
            );
        }

        return TileDTO.fromApi(data);
    }

    async deleteDashboard(dashboardId: number) {
        let { error } = await this.sbService.client
            .from('dashboard')
            .delete()
            .eq('id', dashboardId);
        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to delete dashboard',
                error.details
            );
        }
    }

    // Not used, but might be helpful
    async saveNewTile(tile: NewTile, dashboardId: number) {
        let { error, data } = await this.sbService.client
            .from('dashboard_tile')
            .insert({
                dashboard_id: dashboardId,
                height: tile.height,
                width: tile.width,
                x: 0,
                y: 0
            })
            .select('*')
            .single();

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to save new tile',
                error.details
            );
        }

        return data!;
    }

    // Not used, but might be helpful
    async deleteTiles(tileIds: number[]) {
        let { error } = await this.sbService.client
            .from('dashboard_tile')
            .delete()
            .in('id', tileIds);
        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to delete tiles',
                error.details
            );
        }
    }

    // Not used, but might be helpful
    async saveNewTileContent(source_type: string, definitionId: number, tileId: number) {
        let { error, data } = await this.sbService.client
            .from('dashboard_tile_content')
            .insert({
                dashboard_tile_id: tileId,
                definition_id: definitionId,
                source_type
            })
            .select('*')
            .single();

        if (error) {
            throw new DashboardApiError(
                DashboardApiErrorCode.DB_ERROR,
                'Unable to save tile content',
                error.details
            );
        }

        return data;
    }
}
