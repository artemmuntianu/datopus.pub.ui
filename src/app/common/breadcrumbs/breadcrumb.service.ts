import { Injectable, signal } from '@angular/core';

export interface BreadcrumbInfo {
    path: string[];
    description?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
    private headerBrandcrumb = signal<BreadcrumbInfo | null>(null);

    getHeaderBreadcrumbSignal() {
        return this.headerBrandcrumb.asReadonly();
    }

    setHeaderBreadcrumb(path: string[], description?: string) {
        this.headerBrandcrumb.set({ path, description });
    }

    resetHeaderBreadcrumb() {
        this.headerBrandcrumb.set(null);
    }
}
