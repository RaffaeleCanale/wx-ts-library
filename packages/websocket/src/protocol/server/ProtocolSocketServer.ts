/* eslint-disable no-unused-expressions */
import Logger from '@canale/logger';
import WS from 'ws';

import ProtocolSocket, { ProtocolSocketHandler } from '../ProtocolSocket';
import WebSocketWrapper from '../../WebSocketAdapter';

export interface ProtocolSocketServerOptions {
    port: number;
    protocolRequestTimeout?: number;
}

export interface ProtocolServerHandler extends ProtocolSocketHandler {
    onSocketConnected(socket: ProtocolSocket): void;
}

export default class ProtocolSocketServer {

    private wss?: WS.Server;

    constructor(
        private readonly handler: ProtocolServerHandler,
        private readonly options: ProtocolSocketServerOptions,
        private readonly logger?: Logger,
    ) {}

    start(): void {
        const { port } = this.options;
        this.wss = new WS.Server({
            port,
        });
        this.logger?.info(`WebSocket server is running ws://localhost:${port}`);
        this.wss.on('connection', async (ws) => {
            try {
                const socket = WebSocketWrapper.fromWebSocket(ws);
                const ps = new ProtocolSocket(
                    socket,
                    this.handler,
                    this.options,
                );
                this.logger?.info('Socket connected', { address: socket.getAddress() });
                this.handler.onSocketConnected(ps);
            } catch (error) {
                this.logger?.error('Incoming socket failed', error);
            }
        });
    }
}
