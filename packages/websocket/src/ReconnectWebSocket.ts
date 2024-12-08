import { EventEmitter } from '@canale/emitter';
import { ReusableTimeout } from '@canale/timer';
import { asError } from './utils/Utils.js';
import type WebSocketAdapter from './WebSocketAdapter.js';
import type { SocketEvents, WebSocketImpl } from './WebSocketAdapter.js';
import WebSocketWrapper from './WebSocketAdapter.js';
import { WebSocketClosedError, WsErrorCodes } from './WebSocketClosedError.js';

export interface ReconnectWebSocketOptions {
    /**
     * Time (in ms) the socket will wait before reconnecting.
     */
    reconnectDelay: number | ((retryCount: number) => number);
    /**
     * Maximum number of retries before giving up.
     */
    maxRetries: number;
}

export type SocketState =
    | {
          state: 'idle';
      }
    | {
          state: 'reconnecting';
          failuresCount: number;
          reconnectTimeout: ReusableTimeout;
      }
    | {
          state: 'connected';
          ws: WebSocketAdapter;
      }
    | {
          state: 'disconnected';
      };

/**
 * Wrapper around a WebSocket that will automatically try to reconnect
 * whenever the connection breaks or fails.
 */
export default class ReconnectWebSocket extends EventEmitter<SocketEvents> {
    private readonly WebSocketImpl: WebSocketImpl;
    private readonly address: string;
    private readonly options: ReconnectWebSocketOptions;

    private state: SocketState = { state: 'idle' };

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

    getState(): SocketState['state'] {
        return this.state.state;
    }

    /**
     * Connect the WebSocket. If the connection fails or breaks later on,
     * this will continuously try to reconnect with some back-off timers.
     */
    async connect(): Promise<void> {
        if (this.state.state === 'connected') {
            return;
        }
        if (this.state.state === 'reconnecting') {
            this.state.reconnectTimeout.clearTimeout();
        }

        try {
            const ws = await WebSocketWrapper.connect(
                this.address,
                this.WebSocketImpl,
            );
            ws.on('message', (message) => this.emit('message', message));
            ws.on('error', (error) => this.emit('error', error));
            ws.on('close', (error) => this.onClosed(error));

            this.emit('connect', undefined);
            this.state = { state: 'connected', ws };
        } catch (error) {
            this.onClosed(asError(error));
            throw error;
        }
    }

    send(message: unknown): Promise<void> {
        if (this.state.state !== 'connected') {
            return Promise.reject(new Error('Socket is not connected'));
        }
        return this.state.ws.send(message);
    }

    disconnect(): void {
        switch (this.state.state) {
            case 'connected':
                this.state.ws.disconnect();
                this.state = { state: 'disconnected' };
                break;
            case 'reconnecting':
                this.state.reconnectTimeout.clearTimeout();
                this.state = { state: 'disconnected' };
                break;
            case 'idle':
            case 'disconnected':
                break;
        }
    }

    private onClosed(error: Error | WebSocketClosedError): void {
        if ('code' in error && error.code === WsErrorCodes.CLOSE_NORMAL) {
            this.emit('close', error);
            this.state = { state: 'disconnected' };
            return;
        }

        switch (this.state.state) {
            case 'idle':
            case 'connected':
                this.state = {
                    state: 'reconnecting',
                    failuresCount: 1,
                    reconnectTimeout: new ReusableTimeout(),
                };
                break;
            case 'disconnected':
                return;
            case 'reconnecting':
                this.state.failuresCount += 1;
                break;
        }

        if (this.state.failuresCount > this.options.maxRetries) {
            this.state = { state: 'disconnected' };
            this.emit(
                'close',
                new WebSocketClosedError(
                    WsErrorCodes.CLOSE_ABNORMAL,
                    'Max retries reached',
                ),
            );
            return;
        }

        this.emit('error', error);

        const time = this.getBackOffTime(this.state.failuresCount);
        this.state.reconnectTimeout.resetTimeout(time, () => {
            void this.connect();
        });
    }

    private getBackOffTime(failuresCount: number): number {
        if (typeof this.options.reconnectDelay === 'number') {
            return this.options.reconnectDelay;
        }
        return this.options.reconnectDelay(failuresCount);
    }
}
