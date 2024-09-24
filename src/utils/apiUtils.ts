export function camelCasify(obj: Record<string, unknown>): Record<string, unknown> {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = camelCasify(obj[key] as Record<string, unknown>);
        return result;
    }, {} as Record<string, unknown>);
}