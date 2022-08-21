import { Provider, ValueOrFactory } from './types';

export function wrapError(err: unknown, errorMessage: string): Error {
    const error = err instanceof Error ? err : new Error(String(err));

    const e = new Error(errorMessage);

    (e as any).original = error;
    if (e.stack) {
        e.stack = `${e.stack.split('\n').slice(0, 2).join('\n')}\n${
            error.stack || ''
        }`;
    }
    return e;
}

function isConstructor<T = unknown>(arg: unknown): arg is new () => T {
    return typeof arg === 'function' && arg.prototype;
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
