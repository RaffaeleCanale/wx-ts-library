import AbstractProtocolSocket from "../socket/AbstractProtocolSocket";
import ProtocolSocketHandler from "../ProtocolSocketHandler";

export default class DefaultFallbackHandler implements ProtocolSocketHandler {

    // eslint-disable-next-line class-methods-use-this
    fulfillRequest(message: any, socket: AbstractProtocolSocket): Promise<any> {
        // @ts-ignore
        socket.socket.logger.error(`Cannot fulfill request for channel id ${socket.channelId}: No handler set`);
        throw new Error('Given channel id is not supported');
    }

    // eslint-disable-next-line class-methods-use-this
    onMessage(message: any, socket: AbstractProtocolSocket): void {
        throw new Error(`Cannot process message for channel id ${socket.channelId}: No handler set`);
    }
}
