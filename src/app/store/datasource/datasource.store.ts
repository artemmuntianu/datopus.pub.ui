import { computed, inject } from '@angular/core';

import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
    withMethods,
    withState
} from '@ngrx/signals';

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, from, pipe, switchMap, tap, throttleTime } from 'rxjs';

import { BQDatasource, Datasource, User } from '../../services/api/models';
import { DatasourceService } from './datasource.service';
import { BQApiError, BQApiErrorCode } from '../../services/google/big-query/models/bq-error';
import { GAApiError, GAApiErrorCode } from '../../services/google/ga-data/models/ga-api-error';

type DatasourceState = {
    gaDatasource: Datasource | null;
    bqDatasource: BQDatasource | null;
    bqError: BQApiError | null;
    gaError: GAApiError | null;
    loadingOperations: Record<string, boolean>;
};

const initialState: DatasourceState = {
    gaDatasource: null,
    bqDatasource: null,
    bqError: null,
    gaError: null,
    loadingOperations: {}
};

export const DatasourceStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(state => ({
        loadingBQSource: computed(() => {
            const loadingOperations = state.loadingOperations();
            return loadingOperations['fetchBQDatasource'];
        })
    })),
    withMethods((store, dataService = inject(DatasourceService)) => {
        const updateLoadingState = (operation: string, isLoading: boolean) => {
            patchState(store, state => ({
                loadingOperations: {
                    ...state.loadingOperations,
                    [operation]: isLoading
                }
            }));
        };

        return {
            fetchGADatasource: rxMethod<void>(
                pipe(
                    throttleTime(1000),
                    tap(() => updateLoadingState('fetchGADatasource', true)),
                    switchMap(() =>
                        from(dataService.fetchGADatasource(User.current!.orgId)).pipe(
                            tap(source => {
                                patchState(store, {
                                    gaDatasource: source,
                                    bqError: null
                                });
                            }),
                            catchError(err => {
                                const errorInstance =
                                    err instanceof GAApiError
                                        ? err
                                        : new GAApiError(
                                            GAApiErrorCode.UNKNOWN_ERROR,
                                               'Uknown error occured while fetching Google Analytics datasource'
                                          );

                                patchState(store, { gaError: errorInstance });
                                return EMPTY;
                            }),
                            finalize(() => updateLoadingState('fetchBQDatasource', false))
                        )
                    )
                )
            ),
            // TODO: split auth token from source
            setBQDatasource(source: BQDatasource | null) {
                patchState(store, { bqDatasource: source });
            },
            fetchBQDatasource: rxMethod<void>(
                pipe(
                    throttleTime(1000),
                    tap(() => updateLoadingState('fetchBQDatasource', true)),
                    switchMap(() =>
                        from(dataService.fetchBQDatasource(User.current!.orgId)).pipe(
                            tap(source => {
                                patchState(store, {
                                    bqDatasource: source,
                                    bqError: null
                                });
                            }),
                            catchError(err => {
                                const errorInstance =
                                    err instanceof BQApiError
                                        ? err
                                        : new BQApiError(
                                              BQApiErrorCode.UNKNOWN_ERROR,
                                              'Unknown error occurred while fetching Big Query datasource'
                                          );

                                patchState(store, { bqError: errorInstance });
                                return EMPTY;
                            }),
                            finalize(() => updateLoadingState('fetchBQDatasource', false))
                        )
                    )
                )
            )
        };
    }),
    withHooks({
        onInit(store) {
            store.fetchGADatasource();
        }
    })
);
