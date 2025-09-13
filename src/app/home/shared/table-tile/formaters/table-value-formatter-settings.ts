export type TableValueFormatterSettings =
    | TableValueStringFormatterSettings
    | TableValueNumberFormatterSettings
    | TableValueDateFormatterSettings;

export class FormatterSettings {
    constructor(public locale?: string) {}
}

export class TableValueStringFormatterSettings extends FormatterSettings {}

export class TableValueNumberFormatterSettings extends FormatterSettings {
    constructor(
        public delimiter?: ',' | '.',
        public precision?: number,
        locale?: string
    ) {
        super(locale);
    }
}

export class TableValueDateFormatterSettings extends FormatterSettings {
    constructor(
        public dateFormat?: string,
        locale?: string
    ) {
        super(locale);
    }
}