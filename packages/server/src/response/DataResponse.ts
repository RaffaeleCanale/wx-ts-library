import type { OutgoingHttpHeaders } from 'http';
import type { BaseOptions } from './Response.js';

export interface Data {
    type: 'data';
    data: unknown;
    status: number;
    headers: OutgoingHttpHeaders;
}

export function data(data: unknown, options?: BaseOptions): Data {
    return {
        type: 'data',
        data,
        status: options?.status ?? 200,
        headers: {
            'content-type': 'application/octet-stream',
            ...(options?.headers ?? {}),
        },
    };
}
