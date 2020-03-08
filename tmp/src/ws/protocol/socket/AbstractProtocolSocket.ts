import { v4 as uuidv4 } from 'uuid';

import ProtocolSocketHandler from '../ProtocolSocketHandler';
import AbstractSocket, { SOCKET_EVENTS } from '../../AbstractSocket';
import PendingRequest from '../PendingRequest';

const DEFAULT_TIMEOUT = 10000;

export enum TYPES {
    HANDSHAKE = 'handshake',
    REQUEST = 'request',
    RESPONSE = 'response',
    MESSAGE = 'message',
}

export interface ProtocolMessage {
    id: string;
    type: TYPES;
    content: any;
}

export interface AbstractProtocolSocketOptions {
    timeout?: number;
}

export default abstract class AbstractProtocolSocket {

    protected socket: AbstractSocket;
    protected timeout: number;

    private pendingRequests: { [id: string]: PendingRequest<any> } = {};
    private handler: ProtocolSocketHandler;

    constructor(socket: AbstractSocket, handler: ProtocolSocketHandler, options: AbstractProtocolSocketOptions = {}) {
        this.handler = handler;
        this.socket = socket;
        this.timeout = options.timeout || DEFAULT_TIMEOUT;

        this.socket.on(SOCKET_EVENTS.MESSAGE, (message): void => this.onProtocolMessage(message));
    }

    abstract get channelId(): string;

    setHandler(handler: ProtocolSocketHandler): void {
        this.handler = handler;
    }

    sendMessage(message: any): Promise<any> {
        return this.sendProtocolMessage({
            id: uuidv4(),
            type: TYPES.MESSAGE,
            content: message,
        });
    }

    async sendRequest(message: any): Promise<any> {
        const request = new PendingRequest(this.timeout);
        const id = uuidv4();

        this.pendingRequests[id] = request;
        request.promise.finally(() => {
            delete this.pendingRequests[id];
        });

        await this.sendProtocolMessage({
            id,
            type: TYPES.REQUEST,
            content: message,
        });

        return request.promise;
    }

    private onProtocolMessage(rawMessage: any): void {
        try {
            const message = this.validateMessage(rawMessage);

            switch (message.type) {
                case TYPES.HANDSHAKE:
                    if (this.isHandshaked()) {
                        throw new Error('Multiple handshakes received');
                    }
                    this.handleHandshake(message);
                    break;
                case TYPES.MESSAGE:
                    if (!this.isHandshaked()) {
                        throw new Error('Received message, but handshake was not completed');
                    }
                    this.handleMessage(message);
                    break;
                case TYPES.REQUEST:
                    if (!this.isHandshaked()) {
                        throw new Error('Received request, but handshake was not completed');
                    }
                    this.handleRequest(message);
                    break;
                case TYPES.RESPONSE:
                    if (!this.isHandshaked()) {
                        throw new Error('Received response, but handshake was not completed');
                    }
                    this.handleResponse(message);
                    break;
                default:
                    break;
            }
        } catch (error) {
            this.socket.logger.error(error.message);
        }
    }

    protected abstract handleHandshake(message: ProtocolMessage): void;

    protected abstract isHandshaked(): boolean;

    protected handleMessage(message: ProtocolMessage): void {
        this.handler.onMessage(message.content, this);
    }

    protected async handleRequest(message: ProtocolMessage): Promise<void> {
        let result;
        try {
            result = await this.handler.fulfillRequest(message.content, this);
        } catch (error) {
            await this.sendProtocolMessage({
                id: message.id,
                type: TYPES.RESPONSE,
                content: { error: error.message },
            });
        }

        await this.sendProtocolMessage({
            id: message.id,
            type: TYPES.RESPONSE,
            content: { result },
        });
    }

    protected handleResponse(message: ProtocolMessage): void {
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

    protected sendProtocolMessage(message: ProtocolMessage): Promise<void> {
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
