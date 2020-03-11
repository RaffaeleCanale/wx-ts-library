import http from 'http';
import express, {
    Router,
    RequestHandler,
    Request as ExpressRequest,
    Response,
    NextFunction,
} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getLogger } from '@canale/logger';
import { AddressInfo } from 'net';
import { Middleware, Request, Route, EndpointHandler, Handler, SendFile } from './_shared/api';

export interface ServerOptions {
    port: number;
    bodyLimit: string;
    version: number;
}

function requestAdapter(request: ExpressRequest): Request {
    return {
        path: request.path,
        body: request.body,
        params: request.params,
        query: request.query,
        headers: request.headers as { [header: string]: string },
    };
}

export default class Server {
    private logger = getLogger(__filename);

    private app: express.Express;
    private server: http.Server;
    private port: number;

    constructor(options: ServerOptions, routes: Route[], middlewares?: Middleware[]) {
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

    private wrapMiddleware(middleware: Middleware): RequestHandler {
        return (req: ExpressRequest, res: Response, next: NextFunction): void => {
            middleware(requestAdapter(req))
                .then(() => next())
                .catch((error) => this.handleError(error, res));
        };
    }

    private wrapHandler(handler: Handler): RequestHandler {
        return (req: ExpressRequest, res: Response, next: NextFunction): void => {
            handler(requestAdapter(req))
                .then((response) => {
                    if (response instanceof SendFile) {
                        res.status(200).sendFile(response.filePath);
                    }
                    res.status(200).send(response);
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

    private processEndpoint(endpoint: EndpointHandler): RequestHandler[] {
        return [
            ...endpoint.middlewares.map((middleware) => this.wrapMiddleware(middleware)),
            this.wrapHandler(endpoint.handler),
        ];
    }

    private handleError(error: any, res: Response): any {
        error = error || {};
        this.logger.error(error);
        if (error.httpCode) {
            return res.status(error.httpCode).send({ message: error.message });
        }
        return res.status(500).send({ message: error.message });
    }
}
