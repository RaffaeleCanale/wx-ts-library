export function wrapError(error: Error, errorMessage: string): Error {
    const e = new Error(errorMessage);
    (e as any).original = error;
    if (e.stack) {
        e.stack = `${e.stack.split('\n').slice(0, 2).join('\n')}\n${
            error.stack || ''
        }`;
    }
    return e;
}
