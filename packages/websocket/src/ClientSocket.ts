import WebSocket from 'ws';

import AbstractSocket, { SOCKET_EVENTS } from './AbstractSocket';

export default class ClientSocket extends AbstractSocket {

    private address: string
    private reconnectCounter = 0;
    private reconnectTimeout?: NodeJS.Timeout;

    constructor(address: string, name?: string) {
        super(address, name);
        this.address = address;
    }

    connect(): Promise<void> {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }

        return new Promise((resolve, reject): void => {
            try {
                const ws = new WebSocket(this.address);

                const onError = (error: Error | number): void => {
                    this.disconnect();
                    this.tryReconnect();
                    reject(error);
                };

                ws.on('open', (): void => {
                    this.logger.info('Connected');
                    this.reconnectCounter = 0;
                    this.emit(SOCKET_EVENTS.CONNECT);
                    resolve();
                });

                this.setWs(ws, onError, onError);
            } catch (error) {
                reject(error);
            }
        });
    }

    private tryReconnect(): void {
        if (this.reconnectTimeout) {
            return;
        }

        this.reconnectCounter += 1;
        const time = this.getBackOffTime();
        this.logger.info('Reconnecting', { counter: this.reconnectCounter, time });

        this.reconnectTimeout = setTimeout(
            (): Promise<void> => this.connect().catch(() => {}),
            time,
        );
    }

    private getBackOffTime(): number {
        return this.reconnectCounter * 30 * 1000;
    }
}