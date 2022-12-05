import { getLogger } from '@canale/logger';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, {
    NextFunction,
    Request as ExpressRequest,
    RequestHandler,
    Response,
    Router,
} from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import { ApiError } from './Errors';
import {
    EndpointHandler,
    Handler,
    Middleware,
    Request,
    Route,
} from './_shared/api';

export interface ServerOptions {
    port: number;
    bodyLimit: string;
    version: number;
}

function requestAdapter<T>(request: ExpressRequest): Request<T> {
    return {
        path: request.path,
        body: request.body as T,
        params: request.params,
        query: request.query as { [key: string]: string | string[] },
        headers: request.headers,
    };
}

export default class Server {
    private logger = getLogger(__filename);

    private app: express.Express;
    private server: http.Server;
    private port: number;

    constructor(
        options: ServerOptions,
        routes: Route[],
        middlewares?: Middleware<unknown>[],
    ) {
        this.port = options.port;
        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(cors());
        this.app.use(bodyParser.json({ limit: options.bodyLimit }));

        // internal middleware
        if (middlewares) {
            middlewares.forEach((middleware) => {
                this.app.use('/', this.wrapMiddleware(middleware));
            });
        }

        // api router
        this.app.use(`/api/${options.version}`, this.createRouter(routes));
    }

    start(): void {
        this.server.listen(this.port, (): void => {
            const address = this.server.address() as AddressInfo;
            this.logger.info(`Started on port ${address ? address.port : ''}`);
        });
    }

    private wrapMiddleware<T>(middleware: Middleware<T>): RequestHandler {
        return (
            req: ExpressRequest,
            res: Response,
            next: NextFunction,
        ): void => {
            middleware(requestAdapter<T>(req))
                .then(() => next())
                .catch((error) => this.handleError(error as Error, res));
        };
    }

    private wrapHandler<T>(handler: Handler<T>): RequestHandler {
        return (
            req: ExpressRequest,
            res: Response,
            next: NextFunction,
        ): void => {
            handler(requestAdapter<T>(req))
                .then((response) => {
                    response.send(res);
                })
                .catch((error) => this.handleError(error, res));
        };
    }

    private createRouter(routes: Route[]): Router {
        const router = Router();

        routes.forEach((route) => this.register(router, route));

        return router;
    }

    private register(router: Router, route: Route): void {
        // Iterates over middlewares
        route.middlewares.forEach((middleware) => {
            router.use(route.path, this.wrapMiddleware(middleware));
        });

        if (route.get) {
            router.get(route.path, this.processEndpoint(route.get));
        }
        if (route.post) {
            router.post(route.path, this.processEndpoint(route.post));
        }
        if (route.put) {
            router.put(route.path, this.processEndpoint(route.put));
        }
        if (route.patch) {
            router.patch(route.path, this.processEndpoint(route.patch));
        }
        if (route.delete) {
            router.delete(route.path, this.processEndpoint(route.delete));
        }
    }

    private processEndpoint<T>(endpoint: EndpointHandler<T>): RequestHandler[] {
        return [
            ...endpoint.middlewares.map((middleware) =>
                this.wrapMiddleware<T>(middleware),
            ),
            this.wrapHandler<T>(endpoint.handler),
        ];
    }

    private handleError(e: unknown, res: Response): express.Response {
        const error = e instanceof Error ? e : new Error(String(e));

        this.logger.error(`${error.message}\n${error.stack ?? ''}`);
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .send({ message: error.message });
        }
        return res.status(500).send({ message: error.message });
    }
}
