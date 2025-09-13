import { inject, Injectable } from '@angular/core';
import { UserMessages } from '../../../../consts';
import { Datasource } from '../../../../services/api/models';
import { GaMetadata } from '../../../../services/google/ga-data/models/ga-metadata-resp';
import { GADataService } from '../../../../services/google/ga-data/ga-data.service';
import { ToastrService } from 'ngx-toastr';

const GaDefinitionToUiMapOverrides: { [key: string]: string } = {
    'customEvent:feature': 'Feature',
    'customEvent:prevFeature': 'Source Feature',
    'customEvent:eventType': 'Event Type',
    'customEvent:elemEvent': 'DOM Event',
    'customEvent:elemTag': 'Elem Tag',
    'customEvent:elemName': 'Elem Name',
    'customEvent:elemText': 'Elem Text',
    'eventCount': 'Events',
    'totalUsers': 'Users',
    'totalRevenue': 'Revenue',
};


@Injectable({
    providedIn: 'root',   
})
export class GaMappingService {
    private readonly gaDataService = inject(GADataService);
    private readonly toastr = inject(ToastrService);

    private gaDefinitionToUiMap: { [key: string]: string } = {};
    private uiToGaDefinitionMap: { [key: string]: string } = {};
    private uiToGaDefinitionMapOverrides: { [key: string]: string } = {};

    public async initializeMapping(datasource: Datasource) {
        this.uiToGaDefinitionMapOverrides = this.createReverseMapping(
            GaDefinitionToUiMapOverrides
        );
        
        const response = await this.gaDataService.getMetaData(datasource);

        if (response.data) {
            this.gaDefinitionToUiMap = this.generateMappingsFromMetadata(
                response.data
            );
            this.uiToGaDefinitionMap = this.createReverseMapping(
                this.gaDefinitionToUiMap
            );
            
        } else {
            this.toastr.error(UserMessages.technicalIssue);
        }
    }

    public mapGaDefinitionToUi(gaDimensionOrMetric: string): string {
        return (
            GaDefinitionToUiMapOverrides[gaDimensionOrMetric] ||
            this.gaDefinitionToUiMap[gaDimensionOrMetric] ||
            gaDimensionOrMetric
        );
    }

    public mapUiToGaDefinition(gaDimensionOrMetricUiName: string): string {
        return (
            this.uiToGaDefinitionMapOverrides[gaDimensionOrMetricUiName] ||
            this.uiToGaDefinitionMap[gaDimensionOrMetricUiName] ||
            gaDimensionOrMetricUiName
        );
    }

    private createReverseMapping(
        map: Record<string, string>
    ): Record<string, string> {
        const reverseMap: Record<string, string> = {};
        for (const [key, value] of Object.entries(map)) {
            reverseMap[value] = key;
        }
        return reverseMap;
    }

    private generateMappingsFromMetadata(metadata: GaMetadata): {
        [key: string]: string;
    } {
        const mapping: { [key: string]: string } = {};
        for (const dimension of metadata.dimensions) {
            mapping[dimension.apiName] = dimension.uiName || dimension.apiName;
        }
        for (const metric of metadata.metrics) {
            mapping[metric.apiName] = metric.uiName || metric.apiName;
        }
        return mapping;
    }
}
