import type { Response as ExpressResponse } from 'express';
import type { OutgoingHttpHeaders } from 'http';

export interface BaseOptions {
    status?: number;
    headers?: OutgoingHttpHeaders;
}

export interface Response {
    send(res: ExpressResponse): void;
}

export function withBaseOptions(
    res: ExpressResponse,
    options: BaseOptions | undefined,
    contentType: string,
) {
    return res
        .header({
            'Content-Type': contentType,
            ...(options?.headers ?? {}),
        })
        .status(options?.status ?? 200);
}
