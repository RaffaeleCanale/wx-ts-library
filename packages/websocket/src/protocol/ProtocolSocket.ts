import { v4 as uuidv4 } from 'uuid';

import WebSocketAdapter from '../WebSocketAdapter';
import PendingRequest from '../utils/PendingRequest';
import ReconnectWebSocket from '../ReconnectWebSocket';


enum ProtocolMessageType {
    REQUEST = 'request',
    RESPONSE = 'response',
    MESSAGE = 'message',
}

interface ProtocolMessage {
    id: string;
    channelId: string;
    type: ProtocolMessageType;
    content: any;
}

// export interface ProtocolMessageHandler {
//     fulfillRequest(message: any, channelId: string, socket: ProtocolSocket): Promise<any>;
//     onMessage(message: any, channelId: string, socket: ProtocolSocket): void;
// }

export interface ProtocolSocketHandler {
    /**
     * This handler gets called whenever the remote socket sent a request.
     *
     * @param message Request message
     * @param channelId Channel id
     * @param socket Socket that sent the request
     *
     * @returns The result of the request which will be sent back to the socket.
     */
    fulfillRequest(message: any, channelId: string, socket: ProtocolSocket): Promise<any>;

    /**
     * This handler gets called whenever the remote socket sent a simple message.
     *
     * @param message Message sent
     * @param channelId Channel id
     * @param socket Socket that sent the message
     */
    onMessage(message: any, channelId: string, socket: ProtocolSocket): void;
}

const DEFAULT_PROTOCOL_REQUEST_TIMEOUT = 10000;
export interface ProtocolSocketOptions {
    protocolRequestTimeout?: number;
}

export default class ProtocolSocket {

    private readonly socket: WebSocketAdapter | ReconnectWebSocket;

    private pendingRequests: { [id: string]: PendingRequest<unknown> } = {};
    private handler: ProtocolSocketHandler;
    private protocolRequestTimeout: number;

    constructor(
        socket: WebSocketAdapter | ReconnectWebSocket,
        handler: ProtocolSocketHandler,
        options: ProtocolSocketOptions = {},
    ) {
        this.handler = handler;
        this.socket = socket;
        this.protocolRequestTimeout = options.protocolRequestTimeout
            || DEFAULT_PROTOCOL_REQUEST_TIMEOUT;

        this.socket.on('message', (message): void => this.onProtocolMessage(message));
    }

    getSocket(): WebSocketAdapter | ReconnectWebSocket {
        return this.socket;
    }

    sendMessage(channelId: string, message: any): Promise<void> {
        return this.sendProtocolMessage({
            id: uuidv4(),
            channelId,
            type: ProtocolMessageType.MESSAGE,
            content: message,
        });
    }

    async sendRequest(channelId: string, message: any): Promise<any> {
        const request = new PendingRequest(this.protocolRequestTimeout);
        const id = uuidv4();

        this.pendingRequests[id] = request;
        request.promise.finally(() => {
            delete this.pendingRequests[id];
        });

        await this.sendProtocolMessage({
            id,
            channelId,
            type: ProtocolMessageType.REQUEST,
            content: message,
        });

        return request.promise;
    }

    private onProtocolMessage(rawMessage: any): void {
        const message = this.validateMessage(rawMessage);

        switch (message.type) {
            case ProtocolMessageType.MESSAGE:
                this.handleMessage(message);
                break;
            case ProtocolMessageType.REQUEST:
                this.handleRequest(message);
                break;
            case ProtocolMessageType.RESPONSE:
                this.handleResponse(message);
                break;
            default:
                break;
        }
    }

    private handleMessage(message: ProtocolMessage): void {
        this.handler.onMessage(message.content, message.channelId, this);
    }

    private async handleRequest(message: ProtocolMessage): Promise<void> {
        try {
            const result = await this.handler.fulfillRequest(
                message.content,
                message.channelId,
                this,
            );

            await this.sendProtocolMessage({
                id: message.id,
                channelId: message.channelId,
                type: ProtocolMessageType.RESPONSE,
                content: { result },
            });
        } catch (error) {
            await this.sendProtocolMessage({
                id: message.id,
                channelId: message.channelId,
                type: ProtocolMessageType.RESPONSE,
                content: { error: error.message },
            });
        }
    }

    private handleResponse(message: ProtocolMessage): void {
        const request = this.pendingRequests[message.id];
        if (!request) {
            throw new Error(`No request found for response: ${message.id}`);
        }

        if (message.content.error) {
            request.reject(new Error(message.content.error));
        } else {
            request.resolve(message.content.result);
        }
    }

    private sendProtocolMessage(message: ProtocolMessage): Promise<void> {
        return this.socket.send(message);
    }

    // eslint-disable-next-line class-methods-use-this
    private validateMessage(message: any): ProtocolMessage {
        if (!message.id) {
            throw new Error('Received message without id');
        }
        if (!message.type) {
            throw new Error('Received message without type');
        }
        if (!Object.values(ProtocolMessageType).includes(message.type)) {
            throw new Error(`Received message with invalid type: ${message.type}`);
        }
        return message as ProtocolMessage;
    }
}
