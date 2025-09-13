export interface RequestPayloadMapper<T, R> {
    transform(input: T): R;
}