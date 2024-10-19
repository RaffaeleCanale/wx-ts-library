import ProtocolSocket, { ProtocolSocketHandler } from '../ProtocolSocket.js';
import { ProtocolServerHandler } from './ProtocolSocketServer.js';

export default class MultiChannelHandler implements ProtocolServerHandler {
    constructor(
        private readonly handlers: {
            [channelId: string]: ProtocolSocketHandler;
        },
        private readonly fallbackHandler: ProtocolSocketHandler,
    ) {}

    onMessage(
        message: unknown,
        channelId: string,
        socket: ProtocolSocket,
    ): void {
        void this.getHandler(channelId).fulfillRequest(
            message,
            channelId,
            socket,
        );
    }

    fulfillRequest(
        message: unknown,
        channelId: string,
        socket: ProtocolSocket,
    ): Promise<unknown> {
        return this.getHandler(channelId).fulfillRequest(
            message,
            channelId,
            socket,
        );
    }

    onSocketConnected(): void {
        // No-op
    }

    private getHandler(channelId: string): ProtocolSocketHandler {
        return this.handlers[channelId] ?? this.fallbackHandler;
    }
}
