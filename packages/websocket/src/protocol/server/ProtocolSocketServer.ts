import { WebSocketServer } from 'ws';

import WebSocketWrapper from '../../WebSocketAdapter.js';
import ProtocolSocket, { ProtocolSocketHandler } from '../ProtocolSocket.js';

export interface ProtocolSocketServerOptions {
    port: number;
    protocolRequestTimeout?: number;
}

export interface ProtocolServerHandler extends ProtocolSocketHandler {
    onSocketConnected(socket: ProtocolSocket): void;
}

export default class ProtocolSocketServer {
    private wss?: WebSocketServer;

    constructor(
        private readonly handler: ProtocolServerHandler,
        private readonly options: ProtocolSocketServerOptions,
    ) {}

    start(): void {
        const { port } = this.options;
        this.wss = new WebSocketServer({
            port,
        });
        console.log(`WebSocket server is running ws://localhost:${port}`);
        this.wss.on('connection', (ws) => {
            try {
                const socket = WebSocketWrapper.fromWebSocket(ws);
                const ps = new ProtocolSocket(
                    socket,
                    this.handler,
                    this.options,
                );
                console.debug('Socket connected', {
                    address: socket.getAddress(),
                });
                this.handler.onSocketConnected(ps);
            } catch (error) {
                console.error('Incoming socket failed', error);
            }
        });
    }
}
