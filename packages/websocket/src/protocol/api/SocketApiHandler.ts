import type { Method, Route, Routes } from '@canale/server';
import { ApiError, Request } from '@canale/server';
import type { ProtocolSocketHandler } from '../ProtocolSocket';
import { ApiMessageParse } from './ApiMessage';
import type { ApiResponse } from './ApiResponse';

function parsePathParams(
    pathDefinition: string,
    actualPath: string,
): Record<string, string> | null {
    const defSplit = pathDefinition.split('/');
    const actualSplit = actualPath.split('/');

    if (defSplit.length !== actualSplit.length) {
        return null;
    }

    const params: Record<string, string> = {};
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
    constructor(private readonly routes: Routes) {}

    async fulfillRequest(messageObj: unknown): Promise<ApiResponse> {
        const { path, method, body, headers, query } =
            ApiMessageParse.parse(messageObj);

        const { route, params } = this.findRouteFor(path, method);

        const request = new Request(body, query, params, headers);

        const response = await route(request);

        if (response.type !== 'json') {
            throw new Error('Only json responses are supported');
        }

        return {
            headers: response.headers,
            status: response.status,
            body: response.body,
        };
    }

    onMessage(message: unknown): void {
        void this.fulfillRequest(message);
    }

    private findRouteFor(
        path: string,
        method: Method,
    ): { route: Route; params: Record<string, string> } {
        const routeEntries = Object.entries(this.routes);

        for (const [pathDefinition, routeHandlers] of routeEntries) {
            const params = parsePathParams(pathDefinition, path);

            if (params) {
                const route = routeHandlers[method];
                if (route) {
                    return { route, params };
                }
            }
        }

        throw new ApiError.NotFound('Route not found');
    }
}
