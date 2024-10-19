import Logger from './Logger.js';
import { globalTransports, Transport } from './transport.js';

export { LogContainer } from './Logger.js';
export { Level, setDefaultTransports, Transport } from './transport.js';

export function getLogger(
    name: string,
    transports?: Partial<Transport>[],
): Logger {
    return new Logger(name, transports ?? globalTransports.transports);
}

export default Logger;
