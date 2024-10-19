import type { OutgoingHttpHeaders } from 'http';
import type { BaseOptions } from './Response.js';

export interface Text {
    type: 'text';
    response: string;
    status: number;
    headers: OutgoingHttpHeaders;
}

export function text(data: string, options?: BaseOptions): Text {
    return {
        type: 'text',
        response: data,
        status: options?.status ?? 200,
        headers: {
            'Content-Type': 'text/plain',
            ...(options?.headers ?? {}),
        },
    };
}
