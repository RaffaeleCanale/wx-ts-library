import WebSocket from 'ws';
import AbstractSocket from './AbstractSocket';

function getAddress(ws: WebSocket): string {
    // @ts-ignore
    return `${ws._socket.remoteAddress}:${ws._socket.remotePort}`;
}
export default class ServerSocket extends AbstractSocket {

    constructor(socket: WebSocket, name?: string) {
        super(getAddress(socket), name);
        this.setWs(
            socket,
            this.disconnect.bind(this),
            this.disconnect.bind(this),
        );
    }
}
