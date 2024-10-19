import type { OutgoingHttpHeaders } from 'http';
import type { BaseOptions } from './Response.js';

export interface File {
    type: 'file';
    path: string;
    status: number;
    headers: OutgoingHttpHeaders;
    fileOptions: SendFileOptions;
}

export interface SendFileOptions {
    dotfiles?: 'allow' | 'deny' | 'ignore';
    root?: string;
}

export function file(
    path: string,
    options?: BaseOptions & SendFileOptions,
): File {
    return {
        type: 'file',
        path,
        status: options?.status ?? 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            ...(options?.headers ?? {}),
        },
        fileOptions: {
            dotfiles: options?.dotfiles,
            root: options?.root,
        },
    };
}
