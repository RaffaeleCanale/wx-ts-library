import ProtocolSocket, { ProtocolSocketHandler } from '../ProtocolSocket.js';
import { ProtocolServerHandler } from './ProtocolSocketServer.js';

export default class MultiChannelHandler implements ProtocolServerHandler {
    constructor(
        private readonly handlers: { [channelId: string]: ProtocolSocketHandler },
        private readonly fallbackHandler: ProtocolSocketHandler,
    ) {}

    onMessage(message: any, channelId: string, socket: ProtocolSocket): void {
        this.getHandler(channelId).fulfillRequest(message, channelId, socket);
    }

    fulfillRequest(message: any, channelId: string, socket: ProtocolSocket): Promise<any> {
        return this.getHandler(channelId).fulfillRequest(message, channelId, socket);
    }

    onSocketConnected(socket: ProtocolSocket): void {
        // No-op
    }

    private getHandler(channelId: string): ProtocolSocketHandler {
        return this.handlers[channelId] || this.fallbackHandler;
    }
}
