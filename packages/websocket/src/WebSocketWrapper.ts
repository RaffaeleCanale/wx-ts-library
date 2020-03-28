import NpmWebSocket from 'ws';
import EventEmitter from '@canale/emitter';

const WS_ERROR_CODES: { [code: number]: string } = {
    1000: 'CLOSE_NORMAL',
    1001: 'CLOSE_GOING_AWAY',
    1002: 'CLOSE_PROTOCOL_ERROR',
    1003: 'CLOSE_UNSUPPORTED',
    1005: 'CLOSED_NO_STATUS',
    1006: 'CLOSE_ABNORMAL',
    1007: 'UNSUPPORTED_PAYLOAD',
    1008: 'POLICY_VIOLATION',
    1009: 'CLOSE_TOO_LARGE',
    1010: 'MANDATORY_EXTENSION',
    1011: 'SERVER_ERROR',
    1012: 'SERVICE_RESTART',
    1013: 'TRY_AGAIN_LATER',
    1014: 'BAD_GATEWAY',
    1015: 'TLS_HANDSHAKE_FAIL',
};

export enum SOCKET_EVENTS {
    MESSAGE = 'message',
    CONNECT = 'connect',
    CLOSE = 'close',
}

export type WebSocketImpl = { new(address: string): NpmWebSocket | WebSocket };

function isNpmWebSocket(ws: NpmWebSocket | WebSocket): boolean {
    // @ts-ignore
    return !!ws.on;
}

function getErrorMessage(code: number, reason: string): string {
    return `${reason}: ${WS_ERROR_CODES[code]}`;
}

export const DEV_OPTIONS = {
    logger: null,
};

export default class WebSocketWrapper extends EventEmitter<SOCKET_EVENTS> {

    static fromWebSocket(ws: NpmWebSocket | WebSocket): WebSocketWrapper {
        return new WebSocketWrapper(ws);
    }

    static connect(address: string, WebSocketImpl: WebSocketImpl): Promise<WebSocketWrapper> {
        const ws = new WebSocketImpl(address);
        return new Promise((resolve, reject) => {
            if (isNpmWebSocket(ws)) {
                const npmWs = ws as NpmWebSocket;
                npmWs.on('error', reject);
                npmWs.on('close', reject);
                npmWs.once('open', (): void => {
                    npmWs.off('error', reject);
                    npmWs.off('close', reject);
                    resolve(new WebSocketWrapper(npmWs));
                });
            } else {
                const nativeWs = ws as WebSocket;
                nativeWs.onerror = reject;
                nativeWs.onclose = reject;
                nativeWs.onopen = (): void => {
                    nativeWs.onerror = null;
                    nativeWs.onclose = null;
                    nativeWs.onopen = null;
                    resolve(new WebSocketWrapper(nativeWs));
                };
            }
        });
    }

    private ws?: NpmWebSocket | WebSocket;

    private constructor(ws: NpmWebSocket | WebSocket) {
        super();
        this.ws = ws;
        if (isNpmWebSocket(this.ws)) {
            const npmWs = this.ws as NpmWebSocket;
            npmWs.on('message', (data: string): void => {
                this.receive(data);
            });
            npmWs.on('error', (error: Error) => this.disconnect(error.message));
            npmWs.on('close', (code: number, reason: string) => this.disconnect(getErrorMessage(code, reason)));
        } else {
            const nativeWs = this.ws as WebSocket;
            nativeWs.onmessage = (event: MessageEvent): void => {
                this.receive(event.data);
            };
            nativeWs.onerror = (event: Event) => this.disconnect(event.type);
            nativeWs.onclose = (event: CloseEvent) => this.disconnect(getErrorMessage(event.code, event.reason));
        }
    }

    get isConnected(): boolean {
        return !!this.ws;
    }

    async send(message: any): Promise<void> {
        if (!this.isConnected) {
            return Promise.reject(new Error('Socket is disconnected'));
        }

        return new Promise((resolve, reject) => {
            if (DEV_OPTIONS.logger) {
                // @ts-ignore
                DEV_OPTIONS.logger('=>', message);
            }

            if (isNpmWebSocket(this.ws!)) {
                const npmWs = this.ws as NpmWebSocket;
                npmWs.send(JSON.stringify(message), (error) => (error ? reject(error) : resolve()));
            } else {
                const nativeWs = this.ws as WebSocket;
                try {
                    nativeWs.send(JSON.stringify(message));
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    private disconnect(errorMessage: string): void {
        if (this.ws) {
            this.emit(SOCKET_EVENTS.CLOSE, errorMessage);
            this.ws.close();
            delete this.ws;
            this.ws = undefined;
        }
    }

    private receive(data: string): void {
        if (DEV_OPTIONS.logger) {
            // @ts-ignore
            DEV_OPTIONS.logger('<=', JSON.parse(data));
        }
        this.emit(SOCKET_EVENTS.MESSAGE, JSON.parse(data));
    }
}
