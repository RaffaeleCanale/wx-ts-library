import type { OutgoingHttpHeaders } from 'http';
import type { BaseOptions } from './Response.js';

export interface Json<T> {
    type: 'json';
    body: T;
    status: number;
    headers: OutgoingHttpHeaders;
}

export function json<T>(data: T, options?: BaseOptions): Json<T> {
    return {
        type: 'json',
        body: data,
        status: options?.status ?? 200,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers ?? {}),
        },
    };
}
