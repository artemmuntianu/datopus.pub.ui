import { HttpHeaders } from '@angular/common/http';

export class BaseApiService {
    defaultHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
}