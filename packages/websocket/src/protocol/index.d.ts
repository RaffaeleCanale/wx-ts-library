import ProtocolSocket from './ProtocolSocket';

export interface ProtocolMessageHandler {
    fulfillRequest(message: any, channelId: string, socket: ProtocolSocket): Promise<any>;
    onMessage(message: any, channelId: string, socket: ProtocolSocket): void;
}

export interface ProtocolSocketHandler extends ProtocolMessageHandler {
    onError(error: Error, socket: ProtocolSocket): void;
}
