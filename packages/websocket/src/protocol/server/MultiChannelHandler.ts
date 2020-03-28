/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import Logger from '@canale/logger';
import { ProtocolServerHandler } from './ProtocolSocketServer';
import ProtocolSocket, { ProtocolMessageHandler, ProtocolSocketHandler } from '../ProtocolSocket';

function getAddress(socket: ProtocolSocket): string {
    // @ts-ignore
    const { ws } = socket.socket;
    // @ts-ignore
    return `${ws._socket.remoteAddress}:${ws._socket.remotePort}`;
}

class DefaultFallbackHandler implements ProtocolServerHandler {

    onSocketConnected(socket: ProtocolSocket): void {
        // no-op
    }

    fulfillRequest(message: any, channelId: string, socket: ProtocolSocket): Promise<any> {
        throw new Error(`Cannot process message for channel id ${channelId}: No handler set`)
    }

    onMessage(message: any, channelId: string, socket: ProtocolSocket): void {
        throw new Error(`Cannot process message for channel id ${channelId}: No handler set`)
    }

    onError(error: Error, socket: ProtocolSocket): void {
        // no-op
    }
}

export default class MultiChannelHandler implements ProtocolServerHandler {

    private readonly logger: Logger;
    private readonly handlers: { [channelId: string]: Partial<ProtocolMessageHandler> };
    private fallbackHandler: ProtocolServerHandler;

    constructor(logger: Logger) {
        this.logger = logger;
        this.handlers = {};
        this.fallbackHandler = new DefaultFallbackHandler();
    }

    setHandler(channelId: string, handler: Partial<ProtocolMessageHandler>): void {
        this.handlers[channelId] = handler;
    }

    setFallbackHandler(handler: ProtocolServerHandler): void {
        this.fallbackHandler = handler;
    }

    onMessage(message: any, channelId: string, socket: ProtocolSocket): void {
        try {
            this.getHandler(channelId, 'onMessage')(message, channelId, socket);
        } catch (error) {
            this.onError(error, socket);
        }
    }

    fulfillRequest(message: any, channelId: string, socket: ProtocolSocket): Promise<any> {
        try {
            return this.getHandler(channelId, 'fulfillRequest')(message, channelId, socket);
        } catch (error) {
            this.onError(error, socket);
            return Promise.reject(error);
        }
    }

    onError(error: Error, socket: ProtocolSocket): void {
        this.logger.error('An error occurred', { error: error.message, address: getAddress(socket) });
        this.fallbackHandler.onError(error, socket);
    }

    onSocketConnected(socket: ProtocolSocket): void {
        this.logger.info('Socket connected', { address: getAddress(socket) });
        this.fallbackHandler.onSocketConnected(socket);
    }

    private getHandler<M extends keyof ProtocolMessageHandler>(channelId: string, method: M): ProtocolSocketHandler[M] {
        const handler = this.handlers[channelId];
        if (handler && handler[method]) {
            // @ts-ignore
            return (handler as ProtocolSocketHandler)[method].bind(handler);
        }
        // @ts-ignore
        return this.fallbackHandler[method].bind(this.fallbackHandler);
    }
}