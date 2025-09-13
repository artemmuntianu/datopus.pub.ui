import { BQResponse, BQRow, BQStructData, BQTableFieldSchema, BQValue } from "../models/bq-query-resp";


// NOTE: uncomennt console.warn for debug if needed

export class BQMapper {
    public static map<T = Record<string, any>>(response: BQResponse): T[] {
        const schema = response.schema;

        if (!schema || !schema.fields) {
          // console.warn('BQMapper: Response schema or schema fields are missing.');
            return [];
        }

        if (!response.rows) {
            return [];
        }

        return response.rows.map(row => this._mapRow<T>(row, schema.fields));
    }

    public static getActualColumnName(suggestedName?: string, schema?: BQTableFieldSchema): string | undefined {
        if (!suggestedName || !schema) {
          return undefined;
        }
      
        const actualNames = schema.fields.map(f => f.name);
      
        if (actualNames.includes(suggestedName)) {
          return suggestedName;
        }
      
        // 2. If it contains a dot, try the part after the last dot (handles 'traffic_source.source' -> 'source')
        const lastDotIndex = suggestedName.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          const baseName = suggestedName.substring(lastDotIndex + 1);
          if (actualNames.includes(baseName)) {
            return baseName;
          }
        }
      
        // console.warn(`Could not resolve suggested column name "${suggestedName}" in actual schema: [${actualNames.join(', ')}]`);
        return undefined;
      }

    private static _mapRow<T>(row: BQRow, schemaFields: BQTableFieldSchema[]): T {
         const obj: any = {};
         row.f.forEach((field, index) => {
            if (index >= schemaFields.length) {
              // console.warn(`BQMapper: Row has more fields (${row.f.length}) than schema definition (${schemaFields.length}). Skipping extra fields.`);
                return;
            }
            const columnSchema = schemaFields[index];
            const key = columnSchema.name;
            obj[key] = this._parseValue(field.v, columnSchema);
         });
         return obj as T;
    }

    private static _parseValue(value: BQValue, columnSchema: BQTableFieldSchema): any {
        if (value === null || value === undefined) {
            return null;
        }

        if (columnSchema.mode === 'REPEATED') {
             if (!Array.isArray(value)) {
               // console.warn(`BQMapper: Expected array for REPEATED field '${columnSchema.name}' but got ${typeof value}. Returning raw value.`);
                 return value; // Or return null/empty array?
             }
           
             return value.map((item: any) => this._parseValue(item.v, {
                 ...columnSchema,
                 mode: 'NULLABLE' // Treat items as non-repeated for parsing
             }));
         }


        // For non-repeated fields:
        switch (columnSchema.type) {
            case 'STRING':
                if (columnSchema.name === 'event_date' && typeof value === 'string' && /^\d{8}$/.test(value)) {
                    // Attempt to parse as YYYYMMDD date if it matches the pattern
                    const parsedDate = this._parseDate(value);
                    // Return the parsed date ONLY if successful, otherwise treat as normal string
                    return parsedDate !== null ? parsedDate : this._parseString(value);
                }
                // Otherwise, parse as regular string
                return this._parseString(value);
            case 'INTEGER': // Alias for INT64
                return this._parseInteger(value);
            case 'FLOAT': // Alias for FLOAT64
                return this._parseFloat(value);
            case 'NUMERIC':
                 // WARNING: Precision loss possible. Consider BigInt/Decimal library for BIGNUMERIC.
                return this._parseNumeric(value);
            case 'BIGNUMERIC':
                 // WARNING: Precision loss possible. Consider BigInt/Decimal library.
                return this._parseBigNumeric(value);
            case 'BOOLEAN':
                return this._parseBoolean(value);
            case 'TIMESTAMP':
                // Assumes value is seconds since epoch (string or number)
                return this._parseTimestamp(value);
            case 'DATE':
                return this._parseDate(value);
            case 'DATETIME':
                return this._parseDateTime(value);
            case 'TIME':
                // Parsing 'HH:MM:SS.ssssss' requires specific logic. Returning string.
                return this._parseString(value);
            case 'JSON':
                return this._parseJson(value);
            case 'STRUCT':
            case 'RECORD':
                return this._parseStruct(value, columnSchema);
            case 'BYTES':
                 // Value is Base64 encoded. Returning as is.
                 // Use atob(value) in browser or Buffer.from(value, 'base64') in Node.js to decode.
                return this._parseString(value);
            case 'GEOGRAPHY':
                 // Value is often WKT string. Returning as is. Requires GIS library to parse.
                return this._parseString(value);
            case 'RANGE':
                 // Value is string like '[start, end)'. Returning as is. Requires specific parsing.
                return this._parseString(value);
            default:
              // console.warn(`BQMapper: Unknown BigQuery type encountered: ${columnSchema.type}. Returning raw value.`);
                return value; // Return raw value for unknown types
        }
    }

    // --- Individual Type Parsers ---

    private static _parseString(value: BQValue): string | null {
         if (typeof value !== 'string') {
            // This might happen if the schema is wrong or for unexpected nested data
            // console.warn(`BQMapper: Expected string value but received ${typeof value}.`);
            return value === null ? null : String(value); // Attempt conversion or return null
         }
        return value;
    }

    private static _parseInteger(value: BQValue): number | null {
         if (typeof value !== 'string') {
             // console.warn(`BQMapper: Expected string for INTEGER parsing but received ${typeof value}.`);
             return null;
         }
        try {
            // Use BigInt for potentially large 64-bit integers
            return Number(value);
        } catch (e) {
          // console.warn(`BQMapper: Failed to parse INTEGER value '${value}'. Error: ${e}`);
            return null; // Return null on parsing error
        }
    }

    private static _parseFloat(value: BQValue): number | null {
        if (typeof value !== 'string') {
            // console.warn(`BQMapper: Expected string for FLOAT parsing but received ${typeof value}.`);
            return null;
        }
        const num = parseFloat(value);
        return isNaN(num) ? null : num; // Return null if result is NaN
    }

    private static _parseNumeric(value: BQValue): number | null {
        // NOTE: Potential precision loss for NUMERIC. Use a decimal library if needed.
         if (typeof value !== 'string') {
            // console.warn(`BQMapper: Expected string for NUMERIC parsing but received ${typeof value}.`);
             return null;
         }
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

     private static _parseBigNumeric(value: BQValue): number | null {
         // NOTE: Significant precision loss likely for BIGNUMERIC with parseFloat.
         // Use a decimal library (e.g., decimal.js) for accurate representation.
         if (typeof value !== 'string') {
             // console.warn(`BQMapper: Expected string for BIGNUMERIC parsing but received ${typeof value}.`);
             return null;
         }
         const num = parseFloat(value);
         return isNaN(num) ? null : num;
     }


    private static _parseBoolean(value: BQValue): boolean | null {
         if (typeof value !== 'string' && typeof value !== 'boolean') {
            // console.warn(`BQMapper: Expected string or boolean for BOOLEAN parsing but received ${typeof value}.`);
            return null;
         }
        if (typeof value === 'boolean') return value; // Already a boolean
        // BQ usually returns 'true' or 'false' as strings
        const lowerVal = value.toLowerCase();
        if (lowerVal === 'true') return true;
        if (lowerVal === 'false') return false;
        return null; // Not 'true' or 'false'
    }

    /**
     * Parses TIMESTAMP (assumed UTC). BQ often sends as seconds since epoch.
     */
    private static _parseTimestamp(value: BQValue): Date | null {
         if (typeof value !== 'string' && typeof value !== 'number') {
             // console.warn(`BQMapper: Expected string or number for TIMESTAMP parsing but received ${typeof value}.`);
             return null;
         }
        // Check if it looks like seconds-since-epoch (potentially with fractional part)
        const num = Number(value);
        if (!isNaN(num)) {
            // Multiply by 1000 for JavaScript Date (milliseconds)
            const date = new Date(num * 1000);
            return isNaN(date.getTime()) ? null : date;
        } else if (typeof value === 'string') {
             // Try parsing as ISO-like string (though epoch seconds is more common from API)
            const date = new Date(value);
             return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }

    /**
     * Parses DATE (YYYY-MM-DD). Returns a Date object set to midnight UTC.
     * Be cautious as JS Date objects always have time/timezone components.
     */
    private static _parseDate(value: BQValue): Date | null {
        if (typeof value !== 'string' || value === '') {
            // console.warn(`BQMapper: Expected non-empty string for DATE parsing but received ${typeof value}.`);
            return null;
        }

        // Try YYYYMMDD format first (common in GA4 exports)
        if (/^\d{8}$/.test(value)) {
            try {
                const year = parseInt(value.substring(0, 4), 10);
                const month = parseInt(value.substring(4, 6), 10); // 1-based month
                const day = parseInt(value.substring(6, 8), 10);

                if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    console.warn(`BQMapper: Invalid numeric parts in YYYYMMDD DATE string '${value}'.`);
                    return null;
                }
                // Basic validation for month/day ranges
                if (month < 1 || month > 12 || day < 1 || day > 31) {
                    console.warn(`BQMapper: Invalid month or day in YYYYMMDD DATE string '${value}'.`);
                    return null;
                }

                // Use Date.UTC for unambiguous UTC date creation (month is 0-indexed)
                const timestamp = Date.UTC(year, month - 1, day);
                const date = new Date(timestamp);

                // Final check if the created date is valid and corresponds to the input day
                // (Handles cases like month=2, day=30 which Date.UTC might adjust)
                if (isNaN(date.getTime()) || date.getUTCDate() !== day || date.getUTCMonth() !== month - 1) {
                     console.warn(`BQMapper: Failed to create valid Date or date parts mismatch for YYYYMMDD string '${value}'.`);
                     return null;
                 }
                return date;

            } catch (e) {
                console.warn(`BQMapper: Error parsing YYYYMMDD DATE string '${value}'. Error: ${e}`);
                return null;
            }
        }
        // Try YYYY-MM-DD format next
        else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const date = new Date(`${value}T00:00:00.000Z`); // Assume UTC midnight
            if (isNaN(date.getTime())) {
                //  console.warn(`BQMapper: Invalid DATE format: '${value}'. Could not create Date.`);
                 return null;
             }
            return date;
        }
        else {
            // console.warn(`BQMapper: Unrecognized DATE format: '${value}'. Expected YYYYMMDD or YYYY-MM-DD.`);
            return null;
        }
    }

    /**
     * Parses DATETIME (YYYY-MM-DDTHH:MM:SS.ssssss or similar).
     * Resulting JS Date object includes timezone interpretation.
     */
    private static _parseDateTime(value: BQValue): Date | null {
        if (typeof value !== 'string') {
            // console.warn(`BQMapper: Expected string for DATETIME parsing but received ${typeof value}.`);
            return null;
        }
        // BQ DATETIME often uses ' ' separator, ISO 8601 uses 'T'.
        // Replace space with 'T' for better compatibility with Date constructor.
        // Also handle potential lack of sub-second precision by adding .000 if needed
        let isoString = value.includes('.') ? value.replace(' ', 'T') : value.replace(' ','T') + '.000';

        // Append 'Z' if no timezone offset is present to assume UTC, otherwise Date might assume local time.
        // BQ DATETIME itself has NO timezone, so assuming UTC or local depends on desired interpretation.
        // Let's assume the string represents wall-clock time and let Date parse it.
        // Or force UTC: if (!/[+-]\d{2}:\d{2}|Z$/.test(isoString)) isoString += 'Z';

        const date = new Date(isoString);
        return isNaN(date.getTime()) ? null : date;
    }

    private static _parseJson(value: BQValue): object | null {
        if (typeof value !== 'string') {
            // console.warn(`BQMapper: Expected string for JSON parsing but received ${typeof value}.`);
            return null;
        }
        try {
            return JSON.parse(value);
        } catch (e) {
          // console.warn(`BQMapper: Failed to parse JSON value '${value}'. Error: ${e}`);
            return null;
        }
    }

    /**
     * Parses STRUCT/RECORD recursively.
     */
    private static _parseStruct(value: BQValue, columnSchema: BQTableFieldSchema): Record<string, any> | null {
        // Check if the value is structured as expected for a STRUCT
        if (typeof value !== 'object' || value === null || !('f' in value) || !Array.isArray((value as BQStructData).f)) {
           // console.warn(`BQMapper: Expected object with 'f' array for STRUCT field '${columnSchema.name}' but received`, value);
             return null; // Or return the raw value?
        }

        if (!columnSchema.fields || columnSchema.fields.length === 0) {
           // console.warn(`BQMapper: STRUCT field '${columnSchema.name}' is missing nested field definitions in schema.`);
             return null;
        }

        const structData = value as BQStructData;
        const nestedObj: any = {};

        structData.f.forEach((field, index) => {
            if (index >= columnSchema.fields.length) {
               // console.warn(`BQMapper: Struct has more fields (${structData.f.length}) than schema definition (${columnSchema.fields.length}) for '${columnSchema.name}'. Skipping extra fields.`);
                 return;
            }
            const nestedFieldSchema = columnSchema.fields[index];
            const key = nestedFieldSchema.name;
            // Recursively call the main parser for the nested field
            nestedObj[key] = this._parseValue(field.v, nestedFieldSchema);
        });

        return nestedObj;
    }
}