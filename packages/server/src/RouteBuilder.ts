import { EndpointHandler, Handler, Middleware, Route } from './_shared/api';

type EndpointHandlerBuilder =
    | Handler
    | [Handler]
    | [Middleware, Handler]
    | [Middleware, Middleware, Handler]
    | [Middleware, Middleware, Middleware, Handler];

interface EndpointsBuilder {
    get?: Handler<any>;
    put?: Handler<any>;
    post?: Handler<any>;
    patch?: Handler<any>;
    delete?: Handler<any>;
}

export function handler<T>(callback: Handler<T>): Handler<T> {
    return callback;
}

function toEndpoint(
    endpointBuilder?: EndpointHandlerBuilder,
): EndpointHandler | undefined {
    if (!endpointBuilder) {
        return undefined;
    }

    const array = Array.isArray(endpointBuilder)
        ? endpointBuilder
        : ([endpointBuilder] as [Handler]);

    const middlewares = array.slice(0, -1) as Middleware[];
    const handler = array[array.length - 1] as Handler;

    return { middlewares, handler };
}

export default class RouteBuilder {
    private route: Route;

    constructor(path: string) {
        this.route = {
            path,
            middlewares: [],
        };
    }

    middlewares(...middlewares: Middleware<unknown>[]): this {
        this.route.middlewares = middlewares;
        return this;
    }

    endpoints(endpoints: EndpointsBuilder): this {
        this.route.get = toEndpoint(endpoints.get);
        this.route.put = toEndpoint(endpoints.put);
        this.route.post = toEndpoint(endpoints.post);
        this.route.patch = toEndpoint(endpoints.patch);
        this.route.delete = toEndpoint(endpoints.delete);

        return this;
    }

    build(): Route {
        return this.route;
    }
}
