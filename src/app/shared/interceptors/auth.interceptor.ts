import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { DatasourceStore } from '../../store/datasource/datasource.store';
import { BQAuthService } from '../../services/google/big-query/bq-auth/bq-auth.service';
import { env } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private refreshing = new BehaviorSubject<boolean>(false);
    private refreshPromise: Promise<string> | null = null;
    private store = inject(DatasourceStore);
    private authService = inject(BQAuthService);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { apiBaseUrl } = env;

        const shouldIntercept =
            req.url.startsWith(`${apiBaseUrl}/capture/recorded-sessions`) ||
            (req.url.startsWith(`${apiBaseUrl}/bigquery`) && 
            !req.url.startsWith(`${apiBaseUrl}/bigquery/projects`));

        if (!shouldIntercept) {
            return next.handle(req);
        }

        return this.getAuthToken().pipe(
            switchMap(token => {
                const clonedReq = req.clone({
                    setHeaders: { 'X-Google-Auth-Token': token }
                });
                return next.handle(clonedReq);
            }),
            catchError(err => {
                return throwError(() => err);
            })
        );
    }

    private getAuthToken(): Observable<string> {
        if (this.refreshing.value) {
            return from(this.refreshPromise!);
        }

        this.refreshing.next(true);

        this.refreshPromise = new Promise<string>((resolve, reject) => {
            const source = this.store.bqDatasource();

            if (!source) {
                this.refreshing.next(false);
                reject(new Error('No valid datasource found'));
                return;
            }

            this.authService
                .ensureValidAuthToken(source)
                .then(() => {
                    resolve(source.auth_token?.access_token ?? '');
                    this.store.setBQDatasource(source);
                })
                .catch(err => {
                    reject(err);
                })
                .finally(() => {
                    this.refreshing.next(false);
                });
        });

        return from(this.refreshPromise);
    }
}
