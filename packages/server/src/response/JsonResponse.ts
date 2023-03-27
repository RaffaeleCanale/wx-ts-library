import { BaseOptions } from './Response';

export interface Json<T> {
    type: 'json';
    body: T;
    status: number;
    headers: Record<string, string>;
}

export function json<T>(data: T, options?: BaseOptions): Json<T> {
    return {
        type: 'json',
        body: data,
        status: options?.status ?? 200,
        headers: {
            'Content-Type': 'text/plain',
            ...(options?.headers ?? {}),
        },
    };
}
