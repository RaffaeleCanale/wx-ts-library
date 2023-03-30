import type { BaseOptions } from './Response';

export interface Text {
    type: 'text';
    response: string;
    status: number;
    headers: Record<string, string>;
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
