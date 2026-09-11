import ProtocolSocket, { type ProtocolSocketHandler } from '../ProtocolSocket.js';
import type { ProtocolServerHandler } from './ProtocolSocketServer.js';

export default class MultiChannelHandler implements ProtocolServerHandler {
    private readonly handlers: Record<string, ProtocolSocketHandler>;
    private readonly fallbackHandler: ProtocolSocketHandler;

    constructor(
        handlers: Record<string, ProtocolSocketHandler>,
        fallbackHandler: ProtocolSocketHandler,
    ) {
        this.handlers = handlers;
        this.fallbackHandler = fallbackHandler;
    }

    onMessage(message: unknown, channelId: string, socket: ProtocolSocket): void {
        void this.getHandler(channelId).fulfillRequest(message, channelId, socket);
    }

    fulfillRequest(message: unknown, channelId: string, socket: ProtocolSocket): Promise<unknown> {
        return this.getHandler(channelId).fulfillRequest(message, channelId, socket);
    }

    onSocketConnected(): void {
        // No-op
    }

    private getHandler(channelId: string): ProtocolSocketHandler {
        return this.handlers[channelId] ?? this.fallbackHandler;
    }
}
