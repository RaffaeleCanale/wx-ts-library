import WebSocket from 'ws';
import ServerSocket from '../../ServerSocket';
import ServerProtocolSocket from '../socket/ServerProtocolSocket';
import ProtocolSocketHandler from '../ProtocolSocketHandler';
import AbstractProtocolSocket from '../socket/AbstractProtocolSocket';
import DefaultFallbackHandler from './DefaultFallbackHandler';
import Logger, { getLogger } from '../../../logger/Logger';

export interface ProtocolSocketServerOptions {
    port: number;
    requestTimeout?: number;
}

export default class ProtocolSocketServer implements ProtocolSocketHandler {

    private logger: Logger;
    private wss?: WebSocket.Server;
    private options: ProtocolSocketServerOptions;

    private handlers: { [channelId: string]: ProtocolSocketHandler };
    private fallbackHandler: ProtocolSocketHandler;

    constructor(options: ProtocolSocketServerOptions, name = 'socket-server') {
        this.options = options;
        this.logger = getLogger(name);
        this.handlers = {};
        this.fallbackHandler = new DefaultFallbackHandler();
    }

    setHandler(channelId: string, handler: ProtocolSocketHandler): void {
        this.handlers[channelId] = handler;
    }

    setFallbackHandler(handler: ProtocolSocketHandler): void {
        this.fallbackHandler = handler;
    }

    start(): void {
        const { port } = this.options;
        this.wss = new WebSocket.Server({
            port,
        });
        this.logger.info(`WebSocket server is running ws://localhost:${port}`);
        this.wss.on('connection', async (ws) => {
            try {
                const socket = new ServerProtocolSocket(
                    new ServerSocket(ws),
                    this,
                    { timeout: this.options.requestTimeout },
                );
                await socket.waitForHandshake();
            } catch (error) {
                this.logger.error('Incoming socket failed', error);
            }
        });
    }

    onMessage(message: any, socket: AbstractProtocolSocket): void {
        const handler = this.getHandlerFor(socket);
        handler.onMessage(message, socket);
    }

    fulfillRequest(message: any, socket: AbstractProtocolSocket): Promise<any> {
        const handler = this.getHandlerFor(socket);
        return handler.fulfillRequest(message, socket);
    }

    private getHandlerFor(socket: AbstractProtocolSocket): ProtocolSocketHandler {
        // Verify socket is registered?
        return this.handlers[socket.channelId] || this.fallbackHandler;
    }
}
