import { EndpointHandler, Handler, Middleware, Route } from './_shared/api';

type EndpointHandlerBuilder<T> =
    | Handler<T>
    | [Handler<T>]
    | [Middleware<T>, Handler<T>]
    | [Middleware<T>, Middleware<T>, Handler<T>]
    | [Middleware<T>, Middleware<T>, Middleware<T>, Handler<T>];

interface EndpointsBuilder<
    Get = unknown,
    Put = unknown,
    Post = unknown,
    Patch = unknown,
    Delete = unknown,
> {
    get?: EndpointHandlerBuilder<Get>;
    put?: EndpointHandlerBuilder<Put>;
    post?: EndpointHandlerBuilder<Post>;
    patch?: EndpointHandlerBuilder<Patch>;
    delete?: EndpointHandlerBuilder<Delete>;
}

function toEndpoint<T>(
    endpointBuilder?: EndpointHandlerBuilder<T>,
): EndpointHandler<T> | undefined {
    if (!endpointBuilder) {
        return undefined;
    }

    const array = Array.isArray(endpointBuilder)
        ? endpointBuilder
        : ([endpointBuilder] as [Handler<T>]);

    const middlewares = array.slice(0, -1) as Middleware<T>[];
    const handler = array[array.length - 1] as Handler<T>;

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
