// eslint-disable-next-line import/no-extraneous-dependencies
import type { Middleware, Request, Route } from '@canale/server';
import { ProtocolSocketHandler } from '../ProtocolSocket';

type dict = { [name: string]: string };

export interface ApiMessage {
    path: string;
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    body: any;
    query: dict;
    headers: dict;
}

function parsePathParams(
    pathDefinition: string,
    actualPath: string,
): dict | null {
    const defSplit = pathDefinition.split('/');
    const actualSplit = actualPath.split('/');

    if (defSplit.length !== actualSplit.length) {
        return null;
    }

    const params: dict = {};
    for (let i = 0; i < defSplit.length; i += 1) {
        const definition = defSplit[i];
        const actual = actualSplit[i];

        if (definition.startsWith(':')) {
            const paramName = definition.substr(1);
            const paramValue = actual;

            params[paramName] = paramValue;
        } else if (definition !== actual) {
            return null;
        }
    }

    return params;
}

export default class SocketApiHandler implements ProtocolSocketHandler {
    private routes: Route[];
    private middlewares: Middleware<unknown>[];

    constructor(routes: Route[], middlewares?: Middleware<unknown>[]) {
        this.routes = routes;
        this.middlewares = middlewares || [];
    }

    async fulfillRequest(message: any): Promise<any> {
        const { path, method, body, headers, query } =
            this.validateMessage(message);

        const { route, params } = this.findRouteFor(path);
        if (!route) {
            throw new Error(`No route found for ${path}`);
        }

        const endpoint = route[method];
        if (!endpoint) {
            throw new Error(`Method ${method} not found for ${path}`);
        }
        const request: Request<unknown> = {
            path,
            body,
            headers,
            params,
            query,
        };
        const middlewares = [
            ...this.middlewares,
            ...route.middlewares,
            ...endpoint.middlewares,
        ];
        for (let i = 0; i < middlewares.length; i += 1) {
            const middleware = middlewares[i];
            await middleware(request);
        }

        return endpoint.handler(request);
    }

    onMessage(message: any): void {
        this.fulfillRequest(message);
    }

    private findRouteFor(path: string): { route?: Route; params: dict } {
        for (let i = 0; i < this.routes.length; i += 1) {
            const route = this.routes[i];
            const params = parsePathParams(route.path, path);

            if (params) {
                return { route, params };
            }
        }
        return { params: {} };
    }

    // eslint-disable-next-line class-methods-use-this
    private validateMessage(message: any): ApiMessage {
        if (!message.path) {
            throw new Error('Property `path` is missing in the API message');
        }
        if (!message.method) {
            throw new Error('Property `method` is missing in the API message');
        }
        if (
            !['get', 'post', 'put', 'patch', 'delete'].includes(message.method)
        ) {
            throw new Error('Property `method` is invalid');
        }
        if (!message.body) {
            message.body = {};
        }
        if (!message.query) {
            message.query = {};
        }
        if (!message.headers) {
            message.headers = {};
        }

        return message as ApiMessage;
    }
}
