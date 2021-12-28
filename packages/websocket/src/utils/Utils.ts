export function asError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }
    return new Error(String(error));
}

export function hasStrProperty<K extends string>(
    obj: unknown,
    key: K,
): obj is Record<K, string> {
    const value = (obj as Record<string, unknown>)[key];
    return !!value && typeof value === 'string';
}
