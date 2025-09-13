import { computed, inject, ApplicationRef } from '@angular/core';
import {
    signalStore,
    withState,
    withComputed,
    withMethods,
    patchState,
    withHooks
} from '@ngrx/signals';
import { Dashboard, Tile } from '../../home/dashboard-new/dashboard/dashboard.model';
import { User } from '../../services/api/models';
import { DashboardService } from './dashboard.service';
import { Json } from '../../../../database.types';
import {
    DashboardApiError,
    DashboardApiErrorCode
} from '../../services/api/models/dashboard/error';
import { ToastrService } from 'ngx-toastr';
import { UserMessages } from '../../consts';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, EMPTY, from } from 'rxjs';
import { SubscriptionType } from '../../enums';
import { KtdGridLayout } from '@katoid/angular-grid-layout';
import { UserSubscriptionService } from '../../shared/services/user-subscription.service';
import { ProductKey } from '../../settings/subscription/api/models/product-key';
import { PriceLookupKey } from '../../settings/subscription/api/models/price-lookup-keys';

export const DASHBOARD_WIDTH = 4;
export const DASHBOARD_MAX_ITEM_HEIGHT = 4;
export const DASHBOARD_MAX_ITEM_WIDTH = 4;
export const DASHBOARD_ROW_HEIGHT_PX = 200;

type DashboardState = {
    dashboards: Dashboard[];
    settings: {
        layoutMode: 'view' | 'edit';
    };
    dashboardId: number | null;
    layout: KtdGridLayout | null;
    tiles: Tile[];
    loadingOperations: Record<string, boolean>;
    errors: Record<string, DashboardApiError | null>;
};

const initialState: DashboardState = {
    dashboards: [],
    tiles: [],
    dashboardId: null,
    layout: null,
    settings: { layoutMode: 'view' },
    loadingOperations: {},
    errors: {}
};

const mapLayoutFromTiles = (tiles: Tile[]): KtdGridLayout => {
    return tiles.map(t => ({
        id: t.id.toString(),
        h: t.height,
        w: t.width,
        x: t.x,
        y: t.y,
        // NOTE: probably no max height should be as it not relative to screen size
        maxH: DASHBOARD_MAX_ITEM_HEIGHT,
        maxW: DASHBOARD_MAX_ITEM_WIDTH
    }));
};

export const DashboardStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ loadingOperations, dashboardId, dashboards }) => ({
        loading: computed(() => {
            return Object.values(loadingOperations()).some(loading => loading);
        }),
        selectedDashboard: computed(() => {
            return dashboards().find(d => d.id === dashboardId());
        }),
        loadingTiles: computed(() => {
            return loadingOperations()['fetchTiles'];
        })
    })),
    withMethods(
        (
            store,
            dataService = inject(DashboardService),
            toastrService = inject(ToastrService),
            appRef = inject(ApplicationRef)
        ) => ({
            getDashboardError: (action: string) => computed(() => store.errors()[action] || null),
            updateLayout(layout: KtdGridLayout) {
                patchState(store, { layout });
            },
            async fetchDashboards() {
                try {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, fetchDashboards: true }
                    }));
                    const dashboards = await dataService.fetchDashboards(User.current!.orgId);

                    patchState(store, { dashboards });
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, fetchDashboards: false }
                    }));
                }
            },
            async addDashboard(settings: {
                name: string;
                description: string;
            }): Promise<Dashboard | null> {
                try {
                    patchState(store, () => ({
                        loadingOperations: { ...store.loadingOperations(), addDashboard: true }
                    }));
                    const dashboard = await dataService.createDashboard(
                        settings,
                        User.current!.orgId,
                        User.current!.id
                    );

                    patchState(store, state => ({
                        dashboards: [...state.dashboards, dashboard]
                    }));

                    toastrService.success(UserMessages.dashboardAddSuccess);

                    return dashboard;
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                    return null;
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, addDashboard: false }
                    }));
                }
            },
            async updateDashboard(dashboard: Partial<Dashboard>, dashboardId: number) {
                try {
                    patchState(store, () => ({
                        loadingOperations: { ...store.loadingOperations(), updateDashboard: true }
                    }));

                    const updatedDashboard = await dataService.updateDashboard(
                        dashboard,
                        dashboardId
                    );

                    patchState(store, state => ({
                        dashboards: state.dashboards.map(board => {
                            if (board.id === updatedDashboard.id) {
                                return updatedDashboard;
                            }
                            return board;
                        })
                    }));

                    toastrService.success(UserMessages.dashboardUpdateSuccess);
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, updateDashboard: false }
                    }));
                }
            },
            async deleteDashboard(id?: number) {
                try {
                    patchState(store, () => ({
                        loadingOperations: { ...store.loadingOperations(), deleteDashboard: true }
                    }));
                    const dashboardIdToRemove = id ?? store.dashboardId();

                    if (!dashboardIdToRemove) {
                        return;
                    }

                    await dataService.deleteDashboard(dashboardIdToRemove);

                    const updated = [
                        ...store.dashboards().filter(d => d.id !== dashboardIdToRemove)
                    ];
                    toastrService.success(UserMessages.dashboardDeleteSuccess);

                    patchState(store, {
                        dashboards: updated,
                        dashboardId: updated.length ? updated[0].id : null
                    });
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, deleteDashboard: false }
                    }));
                }
            },

            fetchTiles: rxMethod<number>(
                pipe(
                    tap(dashboardId =>
                        patchState(store, state => ({
                            dashboardId: dashboardId,
                            loadingOperations: { ...state.loadingOperations, fetchTiles: true }
                        }))
                    ),
                    switchMap(dashboardId =>
                        from(dataService.fetchDashboardTiles(dashboardId)).pipe(
                            tap(tiles => {
                                patchState(store, state => ({
                                    loadingOperations: {
                                        ...state.loadingOperations,
                                        fetchTiles: false
                                    },
                                    layout: mapLayoutFromTiles(tiles),
                                    tiles,
                                    errors: { ...state.errors, fetchTiles: null }
                                }));
                            }),
                            catchError(err => {
                                const errorInstance =
                                    err instanceof DashboardApiError
                                        ? err
                                        : new DashboardApiError(
                                              DashboardApiErrorCode.UNKNOWN_ERROR,
                                              'Unknown error occurred while fetching dashboard'
                                          );
                                patchState(store, state => ({
                                    errors: { ...state.errors, fetchTiles: errorInstance },
                                    loadingOperations: {
                                        ...state.loadingOperations,
                                        fetchTiles: false
                                    }
                                }));
                                toastrService.error(errorInstance.message);

                                return EMPTY;
                            })
                        )
                    )
                )
            ),

            async fetchTile(tileId: number) {
                try {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, fetchTile: true }
                    }));
                    const tile = await dataService.fetchTileById(tileId);
                    const tileLayout = mapLayoutFromTiles([tile])[0];

                    patchState(store, state => ({
                        tiles: [...state.tiles, tile],
                        layout: state.layout?.some(l => l.id === tileLayout.id)
                            ? state.layout.map(l => (l.id === tileLayout.id ? tileLayout : l))
                            : [...(state.layout ?? []), tileLayout]
                    }));
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, fetchTile: false }
                    }));
                }
            },
            async updateTileWithSave(id: number, data: Partial<Tile>) {
                try {
                    patchState(store, () => ({
                        loadingOperations: {
                            ...store.loadingOperations(),
                            updateTileWithSave: true
                        }
                    }));

                    const updatedTileDTO = await dataService.updateTile(id, data);

                    patchState(store, state => ({
                        tiles: state.tiles.map(tile => {
                            if (tile.id === updatedTileDTO.id) {
                                return {
                                    content: tile.content,
                                    inputs: tile.inputs,
                                    header: {
                                        subTitle: updatedTileDTO.name,
                                        // TODO: refactor this title evaluation
                                        title: tile.header.title
                                    },
                                    height: updatedTileDTO.height,
                                    id: updatedTileDTO.id,
                                    name: updatedTileDTO.name,
                                    backgroundColor: updatedTileDTO.backgroundColor,
                                    description: updatedTileDTO.description,
                                    x: updatedTileDTO.x,
                                    y: updatedTileDTO.y,
                                    width: updatedTileDTO.width
                                };
                            }
                            return tile;
                        })
                    }));

                    toastrService.success(UserMessages.tileUpdateSuccess);
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, updateTileWithSave: false }
                    }));
                }
            },
            async saveNewTile(
                newTileDefinition: {
                    height: number;
                    width: number;
                    name: string;
                    description?: string;
                },
                content: { settings: Json }
            ): Promise<{
                contentId: number;
                tileId: number;
            } | null> {
                try {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, saveNewTile: true }
                    }));
                    const relation = await dataService.saveNewTileWithContentRPC(
                        store.dashboardId()!,
                        newTileDefinition,
                        content
                    );

                    this.fetchTile(relation.dashboard_tile_id);

                    toastrService.success(UserMessages.tileAddSuccess);

                    return {
                        contentId: relation.visual_definition_id,
                        tileId: relation.dashboard_tile_id
                    };
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                    return null;
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, saveNewTile: false }
                    }));
                }
            },

            async deleteTile(id: number) {
                try {
                    patchState(store, () => ({
                        loadingOperations: {
                            ...store.loadingOperations(),
                            removeTileWithSave: true
                        }
                    }));

                    await dataService.deleteTiles([id]);

                    patchState(store, state => ({
                        tiles: state.tiles.filter(t => t.id !== id)
                    }));

                    toastrService.success(UserMessages.tileDeleteSuccess);
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, removeTileWithSave: false }
                    }));
                }
            },
            // TODO: narrow down its responsibility to update layout only
            async saveTiles() {
                try {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, saveTile: true }
                    }));

                    const tiles = store.tiles().map(t => ({ ...t }));
                    const layout = store.layout();

                    if (layout) {
                        tiles.forEach(t => {
                            const item = layout.find(item => item.id === t.id.toString());
                            if (item) {
                                t.x = item.x;
                                t.y = item.y;
                                t.height = item.h;
                                t.width = item.w;
                            }
                        });
                    }

                    await dataService.upsertTilesRPC(tiles, [], store.dashboardId()!);

                    patchState(store, { tiles });

                    toastrService.success(UserMessages.dashboardTilesSavedSuccess);
                } catch (err) {
                    if (err instanceof DashboardApiError) {
                        toastrService.error(err.message);
                    } else {
                        console.error(err);
                        toastrService.error(UserMessages.technicalIssue);
                    }
                    patchState(store, state => ({
                        layout: mapLayoutFromTiles(state.tiles)
                    }));
                } finally {
                    patchState(store, state => ({
                        loadingOperations: { ...state.loadingOperations, saveTile: false }
                    }));
                }
            },
            setLayoutMode(layoutMode: 'view' | 'edit', restore = false) {
                if (restore) {
                    patchState(store, state => ({ layout: mapLayoutFromTiles(state.tiles) }));
                }

                patchState(store, { settings: { layoutMode } });
            },
            // NOT USED -------------------------------------------------------
            removeTile(id: number) {
                const tiles = store.tiles();
                const result = tiles.filter(tile => tile.id !== id);
                patchState(store, { tiles: result });
                appRef.tick();
            },
            updateTile(id: number, data: Partial<Tile>) {
                const result = store.tiles().map(tile => {
                    if (tile.id === id) {
                        return { ...tile, ...data };
                    } else {
                        return tile;
                    }
                });

                patchState(store, {
                    tiles: result
                });
            }
        })
    ),
    withHooks(store => ({
        onInit() {
            const userSubscriptionService = inject(UserSubscriptionService);

            if (
                userSubscriptionService.hasAccess(
                    User.current!.orgSubscription,
                    [PriceLookupKey.OptimizeMonthly]
                )
            ) {
                store.fetchDashboards();
            }
        }
    }))
);
