import type { IncomingHttpHeaders } from 'http';
import type { ParsedQs } from 'qs';

interface SendFileOptions {
    dotfiles?: 'allow' | 'deny' | 'ignore';
    headers?: Record<string, string>;
    root?: string;
}

export type RequestResponse = SendFile | unknown;

export interface SendFile {
    __responseType: 'send_file';
    filePath: string;
    options?: SendFileOptions;
}

export function sendFileResponse(
    filePath: string,
    options?: SendFileOptions,
): SendFile {
    return {
        __responseType: 'send_file',
        filePath,
        options,
    };
}

export function isSendFile(response: RequestResponse): response is SendFile {
    return (
        typeof response === 'object' &&
        !!response &&
        '__responseType' in response &&
        response.__responseType === 'send_file'
    );
}

export interface Request {
    path: string;
    body: unknown;
    params: Record<string, string>;
    query: ParsedQs;
    headers: IncomingHttpHeaders;
}

export type Middleware = (request: Request) => Promise<void>;
export type Handler = (request: Request) => Promise<RequestResponse>;
export type EndpointHandler = {
    middlewares: Middleware[];
    handler: Handler;
};

export interface Route {
    path: string;
    middlewares: Middleware[];

    get?: EndpointHandler;
    put?: EndpointHandler;
    post?: EndpointHandler;
    patch?: EndpointHandler;
    delete?: EndpointHandler;
}
