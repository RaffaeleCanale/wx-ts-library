import { Route, Middleware, Handler, EndpointHandler } from './_shared/api';

type EndpointHandlerBuilder = Handler | [Middleware, Handler] | [Middleware, Middleware, Handler] | [Middleware, Middleware, Middleware, Handler]

type EndpointsBuilder = {
    get?: EndpointHandlerBuilder;
    put?: EndpointHandlerBuilder;
    post?: EndpointHandlerBuilder;
    patch?: EndpointHandlerBuilder;
    delete?: EndpointHandlerBuilder;
}

function toEndpoint(endpointBuilder?: EndpointHandlerBuilder): EndpointHandler | undefined {
    if (!endpointBuilder) {
        return undefined;
    }

    const array: any[] = Array.isArray(endpointBuilder) ? endpointBuilder : [endpointBuilder];

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

    middlewares(...middlewares: Middleware[]): this {
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
