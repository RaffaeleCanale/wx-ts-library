import { v4 as uuidv4 } from 'uuid';
import type ReconnectWebSocket from '../ReconnectWebSocket.js';
import type WebSocketAdapter from '../WebSocketAdapter.js';
import PendingRequest from '../utils/PendingRequest.js';
import { asError, hasStrProperty } from '../utils/Utils.js';

type ProtocolMessageRequest = {
    id: string;
    channelId: string;
    type: 'message' | 'request';
    content: unknown;
};
type ProtocolMessageResponse = {
    id: string;
    channelId: string;
    type: 'response';
    content:
        | {
              result: unknown;
          }
        | {
              error: string;
          };
};
type ProtocolMessage = ProtocolMessageRequest | ProtocolMessageResponse;

export type ProtocolSocketHandler = {
    /**
     * This handler gets called whenever the remote socket sent a request.
     *
     * @param message Request message
     * @param channelId Channel id
     * @param socket Socket that sent the request
     *
     * @returns The result of the request which will be sent back to the socket.
     */
    fulfillRequest(
        message: unknown,
        channelId: string,
        socket: ProtocolSocket,
    ): Promise<unknown>;

    /**
     * This handler gets called whenever the remote socket sent a simple message.
     *
     * @param message Message sent
     * @param channelId Channel id
     * @param socket Socket that sent the message
     */
    onMessage(
        message: unknown,
        channelId: string,
        socket: ProtocolSocket,
    ): void;
};

const DEFAULT_PROTOCOL_REQUEST_TIMEOUT = 10000;
export type ProtocolSocketOptions = {
    protocolRequestTimeout?: number;
};

export default class ProtocolSocket {
    private readonly socket: WebSocketAdapter | ReconnectWebSocket;

    private pendingRequests: Record<string, PendingRequest> = {};
    private handler: ProtocolSocketHandler;
    private protocolRequestTimeout: number;

    constructor(
        socket: WebSocketAdapter | ReconnectWebSocket,
        handler: ProtocolSocketHandler,
        options: ProtocolSocketOptions = {},
    ) {
        this.handler = handler;
        this.socket = socket;
        this.protocolRequestTimeout =
            options.protocolRequestTimeout ?? DEFAULT_PROTOCOL_REQUEST_TIMEOUT;

        this.socket.on('message', (message): void =>
            this.onProtocolMessage(message),
        );
    }

    getSocket(): WebSocketAdapter | ReconnectWebSocket {
        return this.socket;
    }

    sendMessage(channelId: string, message: unknown): Promise<void> {
        return this.sendProtocolMessage({
            id: uuidv4(),
            channelId,
            type: 'message',
            content: message,
        });
    }

    async sendRequest(channelId: string, message: unknown): Promise<unknown> {
        const request = new PendingRequest(this.protocolRequestTimeout);
        const id = uuidv4();

        this.pendingRequests[id] = request;
        void request.promise.finally(() => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.pendingRequests[id];
        });

        try {
            await this.sendProtocolMessage({
                id,
                channelId,
                type: 'request',
                content: message,
            });
        } catch (error) {
            request.reject(asError(error));
        }

        return request.promise;
    }

    private onProtocolMessage(rawMessage: unknown): void {
        const message = this.validateMessage(rawMessage);

        switch (message.type) {
            case 'message':
                this.handleMessage(message);
                break;
            case 'request':
                void this.handleRequest(message);
                break;
            case 'response':
                this.handleResponse(message);
                break;
            default:
                break;
        }
    }

    private handleMessage(message: ProtocolMessageRequest): void {
        this.handler.onMessage(message.content, message.channelId, this);
    }

    private async handleRequest(
        message: ProtocolMessageRequest,
    ): Promise<void> {
        try {
            const result = await this.handler.fulfillRequest(
                message.content,
                message.channelId,
                this,
            );

            await this.sendProtocolMessage({
                id: message.id,
                channelId: message.channelId,
                type: 'response',
                content: { result },
            });
        } catch (error) {
            await this.sendProtocolMessage({
                id: message.id,
                channelId: message.channelId,
                type: 'response',
                content: { error: asError(error).message },
            });
        }
    }

    private handleResponse(message: ProtocolMessageResponse): void {
        const request = this.pendingRequests[message.id];
        if (!request) {
            throw new Error(`No request found for response: ${message.id}`);
        }

        if ('error' in message.content) {
            request.reject(new Error(message.content.error));
        } else {
            request.resolve(message.content.result);
        }
    }

    private sendProtocolMessage(message: ProtocolMessage): Promise<void> {
        return this.socket.send(message);
    }

    private validateMessage(message: unknown): ProtocolMessage {
        if (!hasStrProperty(message, 'id')) {
            throw new Error('Received message without id');
        }
        if (!hasStrProperty(message, 'type')) {
            throw new Error('Received message without type');
        }
        const types: ProtocolMessage['type'][] = [
            'message',
            'request',
            'response',
        ];
        if (!types.includes(message.type as ProtocolMessage['type'])) {
            throw new Error(
                `Received message with invalid type: ${message.type}`,
            );
        }
        return message as ProtocolMessage;
    }
}
