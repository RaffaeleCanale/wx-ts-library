import AbstractProtocolSocket from './socket/AbstractProtocolSocket';

export default interface ProtocolSocketHandler {
    fulfillRequest(message: any, socket: AbstractProtocolSocket): Promise<any>;
    onMessage(message: any, socket: AbstractProtocolSocket): void;
};
