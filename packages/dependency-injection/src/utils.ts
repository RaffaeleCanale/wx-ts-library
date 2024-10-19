import { Provider, ValueOrFactory } from './types';

export function wrapError(err: unknown, errorMessage: string): Error {
    const error = err instanceof Error ? err : new Error(String(err));

    const e = new Error(errorMessage) as Error & { original: Error };

    e.original = error;
    if (e.stack) {
        e.stack = `${e.stack.split('\n').slice(0, 2).join('\n')}\n${
            error.stack ?? ''
        }`;
    }
    return e;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
function isConstructor<T>(arg: unknown): arg is new () => T {
    return typeof arg === 'function' && !!arg.prototype;
}

function isProvider<T = unknown>(arg: unknown): arg is Provider<T> {
    return typeof arg === 'function';
}

export function getValueOf<T>(value: ValueOrFactory<T>): T {
    if (isConstructor(value)) {
        return new value();
    }
    if (isProvider(value)) {
        return value();
    }
    return value;
}
