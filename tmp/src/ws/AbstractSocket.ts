import WebSocket from 'ws';
import Logger, { getLogger } from '../logger/Logger';
import EventEmitter from '../utils/EventEmitter';

const WS_ERROR_CODES: {[code: number]: string} = {
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

type errorCallback = (error: Error | number) => void

export default abstract class AbstractSocket extends EventEmitter<SOCKET_EVENTS> {

    public logger: Logger;
    private ws?: WebSocket;

    constructor(address: string, name = 'socket') {
        super();
        this.logger = getLogger(`[${name}]@${address}`);
    }

    protected setWs(ws: WebSocket, onError: errorCallback, onClosed: errorCallback): void {
        this.ws = ws;
        this.ws.on('message', (data: string): void => {
            try {
                this.emit(SOCKET_EVENTS.MESSAGE, JSON.parse(data));
            } catch (error) {
                this.logger.error(error);
            }
        });
        this.ws.on('error', (error: Error | number): void => {
            this.logger.error('Error', error, WS_ERROR_CODES[error as number]);
            onError(error);
        });
        this.ws.on('close', (error: Error | number): void => {
            this.logger.error('Connection closed', error, WS_ERROR_CODES[error as number]);
            onClosed(error);
        });
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

    async sendSafe(message: object): Promise<void> {
        try {
            await this.send(message);
        } catch (error) {
            this.logger.error('Cannot send message', error);
        }
    }

    protected disconnect(): void {
        if (this.ws) {
            this.emit(SOCKET_EVENTS.CLOSE);
            this.ws.close();
            delete this.ws;
            this.ws = undefined;
        }
    }
}
