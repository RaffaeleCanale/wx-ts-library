import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type { AddressInfo } from 'net';
import { ApiError } from './ApiError.js';
import { Request } from './Request.js';
import type { Method, Route, Routes } from './Route.js';
import type { Response } from './response/Response.js';

export interface ServerOptions {
    port: number;
    bodyLimit: string;
    prefix: string;
}

interface Logger {
    info(message: string): void;
    error(message: string): void;
}

function doSend(res: express.Response, response: Response): express.Response {
    switch (response.type) {
        case 'json':
            return res.json(response.body);
        case 'text':
            return res.send(response.response);
        case 'data':
            return res.send(response.data);
        case 'file':
            res.sendFile(response.path, response.fileOptions);
            return res;
        default:
            throw new Error('Unknown response type');
    }
}

export class Server {
    private readonly app: express.Express;
    private readonly server: http.Server;
    private readonly port: number;

    constructor(
        options: ServerOptions,
        routes: Routes,
        private readonly logger?: Logger,
    ) {
        this.port = options.port;
        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(cors());
        this.app.use(bodyParser.json({ limit: options.bodyLimit }));

        // internal middleware
        // if (middlewares) {
        //     middlewares.forEach((middleware) => {
        //         this.app.use('/', this.wrapMiddleware(middleware));
        //     });
        // }

        // api router
        this.app.use(options.prefix, this.createRouter(routes));
    }

    start(): void {
        this.server.listen(this.port, (): void => {
            const address = this.server.address() as AddressInfo | null;
            this.logger?.info(
                `Started on port ${address ? String(address.port) : ''}`,
            );
        });
    }

    private createRouter(routes: Routes): express.Router {
        const router = express.Router();

        Object.entries(routes).forEach(([path, routes]) => {
            Object.entries(routes).forEach(([method, route]) => {
                router[method as Method](path, (req, res) => {
                    void this.handle(route, req, res);
                });
            });
        });

        return router;
    }

    private async handle(
        route: Route,
        req: express.Request,
        res: express.Response,
    ): Promise<void> {
        try {
            const request = Request.fromExpress(req);

            const response = await route(request);

            doSend(
                res.status(response.status).header(response.headers),
                response,
            );
        } catch (error) {
            const apiError = ApiError.from(error);

            this.logger?.error(`${apiError.message}\n${apiError.stack ?? ''}`);

            res.status(apiError.statusCode).send(apiError.toJson());
        }
    }
}
