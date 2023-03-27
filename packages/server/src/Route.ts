import { Request } from './Request';
import { Response } from './response/Response';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type Route = (request: Request) => Response | Promise<Response>;

export type Routes = {
    [path: string]: Partial<Record<Method, Route>>;
};
