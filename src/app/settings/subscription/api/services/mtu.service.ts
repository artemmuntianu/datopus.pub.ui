import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class MTUApiService {
    private readonly sbService = inject(SupabaseService);

    async fetchMTUTotalPerCurrentCycle(orgId: number): Promise<number | null> {
        const { data, error } = await this.sbService.client.rpc("get_total_mtu_per_current_cycle", { in_org_id: orgId })

        if (error) {
            console.error(error);
        }

        return data;
    }
}
