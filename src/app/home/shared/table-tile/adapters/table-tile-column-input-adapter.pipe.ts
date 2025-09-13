import { Pipe, PipeTransform } from '@angular/core';
import { TableColumnDefinition } from '../table-tile.component';
import { BQTableFieldSchema } from '../../../../services/google/big-query/models/bq-query-resp';
import {
    TableValueDateFormatterSettings,
    FormatterSettings,
    TableValueNumberFormatterSettings
} from '../formaters/table-value-formatter-settings';

@Pipe({
    name: 'ttColInput',
    pure: true,
    standalone: true
})
// NOTE: consider passing Maps for better lookup
export class TableTileColumnInputAdapter implements PipeTransform {
    transform(columns?: string[] | null, schema?: BQTableFieldSchema): TableColumnDefinition[] {
        if (!columns) {
            return [];
        }

        const fields = schema?.fields || [];

        return columns.map(c => {
            const field = fields.find(f => f.name === c);
            let formatter: FormatterSettings | undefined = undefined;

            if (field) {
                // NOTE:
                // c === event_date is hack, consider generate new schema based on parsed response in BQMapper
                if (field.type === 'DATE' || c === 'event_date') {
                    formatter = new TableValueDateFormatterSettings('yyyy-MM-dd');
                } else if (['FLOAT', 'NUMERIC', 'BIGNUMERIC', 'INTEGER'].includes(field.type)) {
                    formatter = new TableValueNumberFormatterSettings(',', 2);
                }
            }

            return {
                name: c,
                formatterSettings: formatter
            };
        });
    }
}
