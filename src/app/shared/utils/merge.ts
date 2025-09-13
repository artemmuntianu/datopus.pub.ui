function isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === "object";
}

export function merge<T extends Record<string, any>, U extends Record<string, any>>(target: T, source: U): T & U {
    if (!isObject(target) || !isObject(source)) {
        return source as T & U;
    }

    for (const key in source) {
        if (isObject(source[key])) {
            if (!target[key]) {
                target[key] = {} as any;
            }
            target[key] = merge(target[key], source[key]);
        } else {
            target[key] = source[key] as any;
        }
    }

    return target as T & U;
}