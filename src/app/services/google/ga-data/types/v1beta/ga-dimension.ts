export interface GaDimension {
    name?: string;
    dimensionExpression?: GaDimensionExpression;
}

export type GaDimensionExpression =
    | {
          lowerCase?: GaCaseExpression;
      }
    | {
          upperCase?: GaCaseExpression;
      }
    | {
          concatenate?: GaConcatenateExpression;
      };

export interface GaCaseExpression {
    dimensionName?: string;
}

export interface GaConcatenateExpression {
    dimensionNames?: string[];
    delimiter?: string;
}

export interface DimensionHeader {
    name: string;
}

export interface DimensionValue {
    value: string;
}
