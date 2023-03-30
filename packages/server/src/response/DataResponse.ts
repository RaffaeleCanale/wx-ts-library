import type { BaseOptions } from './Response';

export interface Data {
    type: 'data';
    data: unknown;
    status: number;
    headers: Record<string, string>;
}

export function data(data: unknown, options?: BaseOptions): Data {
    return {
        type: 'data',
        data,
        status: options?.status ?? 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            ...(options?.headers ?? {}),
        },
    };
}
