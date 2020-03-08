import http from 'http';
import express from 'express';
import _ from 'lodash';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getLogger } from '~/Logger';
import middleware from '~/api/middleware';
import { Route, Handler } from '~/api/utils/RoutesBuilder';
import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { Middleware } from '..';

export interface ServerOptions {
    port: number;
    bodyLimit: string;
}

export default class Server {
    private logger = getLogger(__filename);

    private middlewares: Middleware[];
    private app: express.Express;
    private server: any;
    private port: number;

    constructor(options: ServerOptions, routes: Route[]) {
        this.port = options.port;
        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(cors());
        this.app.use(bodyParser.json({ limit: options.bodyLimit }));

        // internal middleware
        this.app.use(middleware());

        // api router
        this.app.use('/api', this.createRouter(routes));
    }

    start(): void {
        this.server.listen(this.port, (): void => {
            // @ts-ignore
            this.logger.info(`Started on port ${this.server.address().port}`);
        });
    }

    private wrapMiddleware(handler: Handler): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
            try {
                await handler(req);
                return next();
            } catch (error) {
                return this.handleError(error, res);
            }
        };
    }

    private wrapLast(endpointFn: Handler): RequestHandler {
        return async (req: Request, res: Response): Promise<any> => {
            try {
                const result = await endpointFn(req);
                return res.status(200).send(result);
            } catch (error) {
                return this.handleError(error, res);
            }
        };
    }

    private processEndpoint(handlers: Handler[]): RequestHandler[] {
        const last = handlers[handlers.length - 1];
        return [
            ...handlers.slice(0, -1).map(handler => this.wrapMiddleware(handler)),
            ...[this.wrapLast(last)],
        ];
    }

    private register(router: Router, route: Route): void {
        // Iterates over middlewares
        route.middlewares.forEach((middleware) => {
            router.use(route.path, this.wrapMiddleware(middleware));
        });

        const { endpoints } = route;
        if (endpoints.get) {
            router.get(route.path, this.processEndpoint(endpoints.get));
        }
        if (endpoints.post) {
            router.post(route.path, this.processEndpoint(endpoints.post));
        }
        if (endpoints.put) {
            router.put(route.path, this.processEndpoint(endpoints.put));
        }
        if (endpoints.delete) {
            router.delete(route.path, this.processEndpoint(endpoints.delete));
        }
    }

    private createRouter(routes: Route[]): Router {
        const router = Router();

        routes.forEach(route => this.register(router, route));

        return router;
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
