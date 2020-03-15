import { v4 as uuidv4 } from 'uuid';

import WebSocketWrapper, { SOCKET_EVENTS } from '../WebSocketWrapper';
import PendingRequest from '../utils/PendingRequest';

const DEFAULT_TIMEOUT = 10000;

export enum TYPES {
    REQUEST = 'request',
    RESPONSE = 'response',
    MESSAGE = 'message',
}

export interface ProtocolMessage {
    id: string;
    channelId: string;
    type: TYPES;
    content: any;
}

export interface ProtocolMessageHandler {
    fulfillRequest(message: any, channelId: string, socket: ProtocolSocket): Promise<any>;
    onMessage(message: any, channelId: string, socket: ProtocolSocket): void;
}

export interface ProtocolSocketHandler extends ProtocolMessageHandler {
    onError(error: Error, socket: ProtocolSocket): void;
}

export interface ProtocolSocketOptions {
    timeout?: number;
}

export default class ProtocolSocket {

    private readonly socket: WebSocketWrapper;

    private pendingRequests: { [id: string]: PendingRequest<any> } = {};
    private handler: ProtocolSocketHandler;
    private timeout: number;

    constructor(
        socket: WebSocketWrapper,
        handler: ProtocolSocketHandler,
        options: ProtocolSocketOptions = {},
    ) {
        this.handler = handler;
        this.socket = socket;
        this.timeout = options.timeout || DEFAULT_TIMEOUT;

        this.socket.on(SOCKET_EVENTS.MESSAGE, (message): void => this.onProtocolMessage(message));
    }

    sendMessage(channelId: string, message: any): Promise<any> {
        return this.sendProtocolMessage({
            id: uuidv4(),
            channelId,
            type: TYPES.MESSAGE,
            content: message,
        });
    }

    async sendRequest(channelId: string, message: any): Promise<any> {
        const request = new PendingRequest(this.timeout);
        const id = uuidv4();

        this.pendingRequests[id] = request;
        request.promise.finally(() => {
            delete this.pendingRequests[id];
        });

        await this.sendProtocolMessage({
            id,
            channelId,
            type: TYPES.REQUEST,
            content: message,
        });

        return request.promise;
    }

    private onProtocolMessage(rawMessage: any): void {
        try {
            const message = this.validateMessage(rawMessage);

            switch (message.type) {
                case TYPES.MESSAGE:
                    this.handleMessage(message);
                    break;
                case TYPES.REQUEST:
                    this.handleRequest(message);
                    break;
                case TYPES.RESPONSE:
                    this.handleResponse(message);
                    break;
                default:
                    break;
            }
        } catch (error) {
            this.handler.onError(error, this);
        }
    }

    private handleMessage(message: ProtocolMessage): void {
        this.handler.onMessage(message.content, message.channelId, this);
    }

    private async handleRequest(message: ProtocolMessage): Promise<void> {
        let result;
        try {
            result = await this.handler.fulfillRequest(message.content, message.channelId, this);
        } catch (error) {
            await this.sendProtocolMessage({
                id: message.id,
                channelId: message.channelId,
                type: TYPES.RESPONSE,
                content: { error: error.message },
            });
        }

        await this.sendProtocolMessage({
            id: message.id,
            channelId: message.channelId,
            type: TYPES.RESPONSE,
            content: { result },
        });
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
        if (!Object.values(TYPES).includes(message.type)) {
            throw new Error(`Received message with invalid type: ${message.type}`);
        }
        return message as ProtocolMessage;
    }
}
