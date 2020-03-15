import WS from 'ws';
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

type errorCallback = (error: number) => void

export default class WebSocket extends EventEmitter<SOCKET_EVENTS> {

    protected ws?: WS;

    constructor(ws?: WS) {
        super();
        if (ws) {
            this.ws = ws;
            this.ws.on('message', (data: string): void => {
                this.emit(SOCKET_EVENTS.MESSAGE, JSON.parse(data));
            });
            this.ws.on('error', this.disconnect.bind(this));
            this.ws.on('close', this.disconnect.bind(this));
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
            this.ws!.send(JSON.stringify(message), (error) => (error ? reject(error) : resolve()));
        });
    }

    protected disconnect(error: number): void {
        if (this.ws) {
            this.emit(SOCKET_EVENTS.CLOSE, new Error(WS_ERROR_CODES[error]));
            this.ws.close();
            delete this.ws;
            this.ws = undefined;
        }
    }
}
