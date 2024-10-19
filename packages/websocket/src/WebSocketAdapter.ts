import { EventEmitter } from '@canale/emitter';
import type NpmWebSocket from 'ws';
import WebSocketClosedError from './WebSocketClosedError.js';
import { asError } from './utils/Utils.js';

export interface SocketEvents {
    message: unknown;
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    connect: void;
    error: Error;
    close: WebSocketClosedError;
}

export type WebSocketImpl = new (address: string) => NpmWebSocket | WebSocket;

function isNpmWebSocket(ws: NpmWebSocket | WebSocket): ws is NpmWebSocket {
    return !!(ws as { on?: unknown }).on;
}

export const DEV_OPTIONS = {
    logger: null as null | ((...args: unknown[]) => void),
};

/**
 * This is an isomorph adapter of the node and browser websocket.
 */
export default class WebSocketAdapter extends EventEmitter<SocketEvents> {
    static fromWebSocket(ws: NpmWebSocket | WebSocket): WebSocketAdapter {
        return new WebSocketAdapter(ws);
    }

    static connect(
        address: string,
        WebSocketImpl: WebSocketImpl,
    ): Promise<WebSocketAdapter> {
        const ws = new WebSocketImpl(address);
        return new Promise((resolve, reject) => {
            if (isNpmWebSocket(ws)) {
                ws.on('error', reject);
                ws.on('close', reject);
                ws.once('open', (): void => {
                    ws.off('error', reject);
                    ws.off('close', reject);
                    resolve(new WebSocketAdapter(ws));
                });
            } else {
                ws.onerror = reject;
                ws.onclose = reject;
                ws.onopen = (): void => {
                    ws.onerror = null;
                    ws.onclose = null;
                    ws.onopen = null;
                    resolve(new WebSocketAdapter(ws));
                };
            }
        });
    }

    private readonly ws: NpmWebSocket | WebSocket;
    private isClosed = false;

    private constructor(ws: NpmWebSocket | WebSocket) {
        super();
        this.ws = ws;
        if (isNpmWebSocket(this.ws)) {
            this.ws.on('message', (data: string) => this.receive(data));
            this.ws.on('error', (error) => this.fail(error));
            this.ws.on('close', (code, reason) =>
                this.close(code, reason.toString()),
            );
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this.ws.onmessage = (event) => this.receive(event.data);
            this.ws.onerror = (event) => this.fail(new Error(event.type));
            this.ws.onclose = (event) => this.close(event.code, event.reason);
        }
    }

    get isConnected(): boolean {
        return !this.isClosed;
    }

    async send(message: unknown): Promise<void> {
        if (this.isClosed) {
            return Promise.reject(new Error('Socket is disconnected'));
        }

        return new Promise((resolve, reject) => {
            if (DEV_OPTIONS.logger) {
                DEV_OPTIONS.logger('=>', message);
            }

            if (isNpmWebSocket(this.ws)) {
                this.ws.send(JSON.stringify(message), (error) =>
                    error ? reject(error) : resolve(),
                );
            } else {
                try {
                    this.ws.send(JSON.stringify(message));
                    resolve();
                } catch (error) {
                    reject(asError(error));
                }
            }
        });
    }

    disconnect(): void {
        this.close(1000, 'Disconnected by host');
    }

    getAddress(): string {
        // eslint-disable-next-line
        const { _socket } = this.ws as any;
        // eslint-disable-next-line
        return `${_socket.remoteAddress}:${_socket.remotePort}`;
    }

    private fail(error: Error): void {
        this.emit('error', error);
        this.ws.close();
        this.isClosed = true;
    }

    private close(code: number, reason: string): void {
        this.emit('close', new WebSocketClosedError(code, reason));
        this.ws.close();
        this.isClosed = true;
    }

    private receive(data: string): void {
        if (DEV_OPTIONS.logger) {
            DEV_OPTIONS.logger('<=', JSON.parse(data));
        }
        this.emit('message', JSON.parse(data));
    }
}
