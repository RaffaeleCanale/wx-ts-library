export type Request = {
    path: string;
    body: any;
    params: { [name: string]: string };
    query: { [name: string]: string };
    headers: { [name: string]: string };
};

export type Middleware = (request: Request) => Promise<void>;
export type Handler = (request: Request) => Promise<any>;
export type EndpointHandler = {
    middlewares: Middleware[];
    handler: Handler;
}

export interface Route {
    path: string;
    middlewares: Middleware[];

    get?: EndpointHandler;
    put?: EndpointHandler;
    post?: EndpointHandler;
    patch?: EndpointHandler;
    delete?: EndpointHandler;
}
