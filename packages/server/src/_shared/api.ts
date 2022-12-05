import type { IncomingHttpHeaders } from 'http';
import { ServerResponse } from '../ServerResponse';

export interface Request<T> {
    path: string;
    body: T;
    params: Record<string, string>;
    query: { [key: string]: string | string[] };
    headers: IncomingHttpHeaders;
}

export type Middleware<T> = (request: Request<T>) => Promise<void>;
export type Handler<T> = (request: Request<T>) => Promise<ServerResponse>;
export type EndpointHandler<T> = {
    middlewares: Middleware<T>[];
    handler: Handler<T>;
};

export interface Route<
    Get = unknown,
    Post = unknown,
    Put = unknown,
    Patch = unknown,
    Delete = unknown,
> {
    path: string;
    middlewares: Middleware<unknown>[];

    get?: EndpointHandler<Get>;
    put?: EndpointHandler<Put>;
    post?: EndpointHandler<Post>;
    patch?: EndpointHandler<Patch>;
    delete?: EndpointHandler<Delete>;
}
