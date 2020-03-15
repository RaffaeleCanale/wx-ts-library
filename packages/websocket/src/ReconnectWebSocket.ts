import EventEmitter from '@canale/emitter';
import WebSocketWrapper, { SOCKET_EVENTS, WebSocketImpl } from './WebSocketWrapper';

export default class ReconnectWebSocket extends EventEmitter<SOCKET_EVENTS> {

    private readonly WebSocketImpl: WebSocketImpl;
    private readonly address: string
    private reconnectCounter = 0;
    private reconnectTimeout?: NodeJS.Timeout;

    private ws?: WebSocketWrapper;

    constructor(address: string, WebSocketImpl: WebSocketImpl) {
        super();
        this.address = address;
        this.WebSocketImpl = WebSocketImpl;
    }

    get isConnected(): boolean {
        return !!this.ws && this.ws.isConnected;
    }

    async connect(): Promise<void> {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }

        try {
            this.ws = await WebSocketWrapper.connect(this.address, this.WebSocketImpl);
            this.ws.on(SOCKET_EVENTS.MESSAGE, (...args): Promise<any> => this.emit(SOCKET_EVENTS.MESSAGE, ...args));
            this.ws.on(SOCKET_EVENTS.CLOSE, (...args): Promise<any> => {
                this.ws = undefined;
                this.scheduleReconnect();
                return this.emit(SOCKET_EVENTS.CLOSE, ...args);
            });
            this.emit(SOCKET_EVENTS.CONNECT);
        } catch (error) {
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimeout) {
            return;
        }

        this.reconnectCounter += 1;
        const time = this.getBackOffTime();
        this.reconnectTimeout = setTimeout(
            (): Promise<void> => this.connect().catch(() => {}),
            time,
        );
    }

    private getBackOffTime(): number {
        return this.reconnectCounter * 30 * 1000;
    }
}
