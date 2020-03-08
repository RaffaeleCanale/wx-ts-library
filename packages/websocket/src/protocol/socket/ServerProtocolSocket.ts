import WebSocket from 'ws';
import ServerSocket from '../../ServerSocket';
import AbstractProtocolSocket, { ProtocolMessage, AbstractProtocolSocketOptions } from './AbstractProtocolSocket';
import PendingRequest from '../PendingRequest';
import ProtocolSocketHandler from '../ProtocolSocketHandler';
import { SOCKET_EVENTS } from '../../AbstractSocket';

export default class ServerProtocolSocket extends AbstractProtocolSocket {

    channelId = '';
    private handshake: PendingRequest<string>;

    constructor(socket: ServerSocket, handler: ProtocolSocketHandler, options?: AbstractProtocolSocketOptions) {
        super(socket, handler, options);
        this.handshake = new PendingRequest(this.timeout);

        socket.on(SOCKET_EVENTS.CLOSE, (error) => {
            this.handshake = PendingRequest.reject(error);
        });
    }

    waitForHandshake(): Promise<string> {
        return this.handshake.promise;
    }

    protected isHandshaked(): boolean {
        return this.handshake.isResolved;
    }

    protected handleHandshake(message: ProtocolMessage): void {
        const channelId = message.content;
        if (!channelId) {
            this.socket.logger.error('Handshake failed, no channel id', message);
            this.handshake.reject(new Error('No channel id provided'));
            return;
        }

        this.channelId = channelId;
        this.handshake.resolve(channelId);
    }
}
