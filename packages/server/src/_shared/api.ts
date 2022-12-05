import type { IncomingHttpHeaders } from 'http';
import { ServerResponse } from '../ServerResponse';

export interface Request<T = unknown> {
    path: string;
    body: T;
    params: Record<string, string>;
    query: { [key: string]: string | string[] };
    headers: IncomingHttpHeaders;
}

export type Middleware<T = unknown> = (request: Request<T>) => Promise<void>;
export type Handler<T = unknown> = (
    request: Request<T>,
) => Promise<ServerResponse>;
export type EndpointHandler<T = unknown> = {
    middlewares: Middleware<T>[];
    handler: Handler<T>;
};

export interface Route {
    path: string;
    middlewares: Middleware<unknown>[];

    get?: EndpointHandler;
    put?: EndpointHandler;
    post?: EndpointHandler;
    patch?: EndpointHandler;
    delete?: EndpointHandler;
}
