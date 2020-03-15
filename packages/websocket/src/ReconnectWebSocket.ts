import WS from 'ws';
import WebSocket, { SOCKET_EVENTS } from './WebSocket';

type WebSocketImpl = { new(address: string): WS };

function connectWs(address: string, WebSocketImpl: WebSocketImpl): Promise<WS> {
    const ws = new WebSocketImpl(address);
    return new Promise((resolve, reject) => {
        ws.on('error', reject);
        ws.on('close', reject);
        ws.once('open', (): void => {
            ws.off('error', reject);
            ws.off('close', reject);
            resolve(ws);
        });
    });
}


export default class ReconnectWebSocket extends WebSocket {

    private WebSocketImpl: WebSocketImpl;
    private address: string
    private reconnectCounter = 0;
    private reconnectTimeout?: NodeJS.Timeout;

    constructor(address: string, WebSocketImpl: WebSocketImpl) {
        super();
        this.address = address;
        this.WebSocketImpl = WebSocketImpl;
    }

    async connect(): Promise<void> {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }

        this.ws = await connectWs(this.address, this.WebSocketImpl);
        const onError = (error: number): void => {
            this.disconnect(error);
            this.scheduleReconnect();
        };
        this.ws.on('error', onError);
        this.ws.on('close', onError);
        this.ws.on('message', (data: string): void => {
            this.emit(SOCKET_EVENTS.MESSAGE, JSON.parse(data));
        });
        this.emit(SOCKET_EVENTS.CONNECT);
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
