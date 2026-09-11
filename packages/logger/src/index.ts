import Logger from './Logger.js';
import { globalTransports, type Transport } from './transport.js';

export type { LogContainer } from './Logger.js';
export { setDefaultTransports, type Level, type Transport } from './transport.js';

export function getLogger(name: string, transports?: Partial<Transport>[]): Logger {
    return new Logger(name, transports ?? globalTransports.transports);
}

export default Logger;
