import Logger from '@canale/logger';
import WS from 'ws';

import ProtocolSocket, { ProtocolSocketHandler, ProtocolMessageHandler } from '../ProtocolSocket';
import MultiChannelHandler from './MultiChannelHandler';
import WebSocket from '../../WebSocket';

export interface ProtocolSocketServerOptions {
    port: number;
    requestTimeout?: number;
}

export interface ProtocolServerHandler extends ProtocolSocketHandler {
    onSocketConnected(socket: ProtocolSocket): void;
}

export default class ProtocolSocketServer {

    private logger: Logger;
    private options: ProtocolSocketServerOptions;
    private handler: MultiChannelHandler;
    private wss?: WS.Server;

    constructor(options: ProtocolSocketServerOptions, logger: Logger) {
        this.options = options;
        this.logger = logger;
        this.handler = new MultiChannelHandler(logger);
    }

    setHandler(channelId: string, handler: Partial<ProtocolMessageHandler>): void {
        this.handler.setHandler(channelId, handler);
    }

    setFallbackHandler(handler: ProtocolServerHandler): void {
        this.handler.setFallbackHandler(handler);
    }

    start(): void {
        const { port } = this.options;
        this.wss = new WS.Server({
            port,
        });
        this.logger.info(`WebSocket server is running ws://localhost:${port}`);
        this.wss.on('connection', async (ws) => {
            try {
                const socket = new ProtocolSocket(
                    new WebSocket(ws),
                    this.handler,
                    { timeout: this.options.requestTimeout },
                );
                this.handler.onSocketConnected(socket);
            } catch (error) {
                this.logger.error('Incoming socket failed', error);
            }
        });
    }
}
