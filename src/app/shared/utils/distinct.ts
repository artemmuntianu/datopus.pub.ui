export function distinct<T, K extends keyof T>(items: T[], key: K): T[] {
    const set = new Set();
    return items.filter((i) => {
        if (set.has(i[key])) {
            return false;
        }
        set.add(i[key]);
        return true;
    });
}
