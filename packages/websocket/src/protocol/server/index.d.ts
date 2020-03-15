import { ProtocolSocketHandler } from '..';
import ProtocolSocket from '../ProtocolSocket';

export interface ProtocolServerHandler extends ProtocolSocketHandler {
    onSocketConnected(socket: ProtocolSocket): void;
}
