import { WebSocketServer } from 'ws';

import WebSocketWrapper from '../../WebSocketAdapter.js';
import ProtocolSocket, {
    type ProtocolSocketHandler,
} from '../ProtocolSocket.js';

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
        // eslint-disable-next-line no-console
        console.info(
            `WebSocket server is running ws://localhost:${String(port)}`,
        );
        this.wss.on('connection', (ws) => {
            try {
                const socket = WebSocketWrapper.fromWebSocket(ws);
                const ps = new ProtocolSocket(
                    socket,
                    this.handler,
                    this.options,
                );
                this.handler.onSocketConnected(ps);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Incoming socket failed', error);
            }
        });
    }
}
