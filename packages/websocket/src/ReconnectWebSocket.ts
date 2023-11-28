import { EventEmitter } from '@canale/emitter';
import { ReusableTimeout } from '@canale/timer';
import { asError } from './utils/Utils';
import type { SocketEvents, WebSocketImpl } from './WebSocketAdapter';
import WebSocketWrapper from './WebSocketAdapter';
import type WebSocketClosedError from './WebSocketClosedError';

export interface ReconnectWebSocketOptions {
    /**
     * Time (in ms) the socket will wait before reconnecting.
     */
    reconnectDelay: number | ((retryCount: number) => number);
}

/**
 * Wrapper around a WebSocket that will automatically try to reconnect
 * whenever the connection breaks or fails.
 */
export default class ReconnectWebSocket extends EventEmitter<SocketEvents> {
    private readonly WebSocketImpl: WebSocketImpl;
    private readonly address: string;
    private readonly options: ReconnectWebSocketOptions;

    private reconnectCounter = 0;
    private reconnectTimeout = new ReusableTimeout();
    private ws?: WebSocketWrapper;

    /**
     *
     * @param address Host address where this socket will try to connect to.
     * @param WebSocketImpl Base implementation of WebSocket (node or browser).
     */
    constructor(
        address: string,
        webSocketImpl: WebSocketImpl,
        options: ReconnectWebSocketOptions,
    ) {
        super();
        this.address = address;
        this.WebSocketImpl = webSocketImpl;
        this.options = options;
    }

    /**
     * Returns whether the socket is currently connected.
     */
    get isConnected(): boolean {
        return !!this.ws && this.ws.isConnected;
    }

    /**
     * Connect the WebSocket. If the connection fails or breaks later on,
     * this will continuously try to reconnect with some back-off timers.
     */
    async connect(): Promise<void> {
        this.reconnectTimeout.clearTimeout();

        try {
            this.ws = await WebSocketWrapper.connect(
                this.address,
                this.WebSocketImpl,
            );
            this.ws.on('message', (message: unknown) =>
                this.emit('message', message),
            );
            this.ws.on('error', (error: Error) => {
                if (this.ws) {
                    this.ws.disconnect();
                    this.ws = undefined;
                }
                this.scheduleReconnect();
                this.emit('error', error);
            });
            this.ws.on('close', (error: WebSocketClosedError) => {
                if (this.ws) {
                    this.ws = undefined;
                }
                this.scheduleReconnect();
                this.emit('close', error);
            });
            this.emit('connect', undefined);
            this.reconnectCounter = 0;
        } catch (error) {
            this.emit('error', asError(error));
            this.scheduleReconnect();
        }
    }

    send(message: unknown): Promise<void> {
        if (!this.isConnected) {
            return Promise.reject(new Error('Socket is not connected'));
        }
        return this.ws!.send(message);
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.disconnect();
            this.ws = undefined;
            this.reconnectTimeout.clearTimeout();
        }
    }

    private scheduleReconnect(): void {
        this.reconnectCounter += 1;
        const time = this.getBackOffTime();
        this.reconnectTimeout.resetTimeout(time, () => {
            void this.connect();
        });
    }

    private getBackOffTime(): number {
        if (typeof this.options.reconnectDelay === 'number') {
            return this.options.reconnectDelay;
        }
        return this.options.reconnectDelay(this.reconnectCounter);
    }
}
