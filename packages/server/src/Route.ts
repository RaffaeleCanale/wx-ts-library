import { type Request } from './Request.js';
import { type Response } from './response/Response.js';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type Route = (request: Request) => Response | Promise<Response>;

export interface Routes {
    [path: string]: Partial<Record<Method, Route>>;
}
