import { v4 as uuidv4 } from 'uuid';

import AbstractProtocolSocket, { ProtocolMessage, AbstractProtocolSocketOptions, TYPES } from './AbstractProtocolSocket';
import ProtocolSocketHandler from '../ProtocolSocketHandler';
import ClientSocket from '../../ClientSocket';

export default class ClientProtocolSocket extends AbstractProtocolSocket {

    channelId: string;

    constructor(socket: ClientSocket, handler: ProtocolSocketHandler, channelId: string, options?: AbstractProtocolSocketOptions) {
        super(socket, handler, options);
        this.channelId = channelId;
    }

    async connect(): Promise<void> {
        await (this.socket as ClientSocket).connect();
        await this.sendProtocolMessage({
            id: uuidv4(),
            type: TYPES.HANDSHAKE,
            content: this.channelId,
        });
    }

    // eslint-disable-next-line class-methods-use-this
    protected isHandshaked(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    protected handleHandshake(message: ProtocolMessage): void {
        throw new Error('Unexpected handshake received');
    }
}
