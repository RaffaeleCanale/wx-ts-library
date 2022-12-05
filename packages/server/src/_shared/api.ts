import type { IncomingHttpHeaders } from 'http';
import type { ParsedQs } from 'qs';
import { ServerResponse } from '../ServerResponse';

export interface Request {
    path: string;
    body: unknown;
    params: Record<string, string>;
    query: ParsedQs;
    headers: IncomingHttpHeaders;
}

export type Middleware = (request: Request) => Promise<void>;
export type Handler = (request: Request) => Promise<ServerResponse>;
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
