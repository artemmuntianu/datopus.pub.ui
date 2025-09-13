import { Type } from '@angular/core';
import { Database } from '../../../../../database.types';

export type Tile = {
    id: number;
    // Note:
    // header title is populated from definition
    // but it have definition in input and it might be better to not mix definition with tile
    header: {
        title: string;
        subTitle: string;
    };
    description?: string;
    name: string;
    content: Type<unknown> | null;
    inputs?: Record<string, unknown>;
    height: number;
    width: number;
    backgroundColor?: string;
    x: number;
    y: number;
    color?: string;
};

export class TileDTO {
    constructor(
        public id: number,
        public dashboard_id: number,
        public name: string,
        public height: number,
        public width: number,
        public x: number,
        public y: number,
        public description?: string,
        public backgroundColor?: string
    ) {}

    static fromApi(data: Database['public']['Tables']['dashboard_tile']['Row']): TileDTO {
        return new TileDTO(
            data.id,
            data.dashboard_id,
            data.name,
            data.height,
            data.width,
            data.x,
            data.y,
            data.description ?? undefined,
            data.background_color ?? undefined
        );
    }
}

export class Dashboard {
    constructor(
        public id: number,
        public name: string,
        public orgId: number,
        public description: string | null,
        public authorId: string | null,
        public createdAt: Date,
        public updatedAt: Date
    ) {}

    static fromApi(data: Database['public']['Tables']['dashboard']['Row']): Dashboard {
        return new Dashboard(
            data.id,
            data.name,
            data.org_id,
            data.description,
            data.author_id,
            new Date(data.created_at),
            new Date(data.updated_at)
        );
    }
}
