import Logger from './Logger';
import { globalTransports, Transport } from './transport';

export { Level, LogContainer } from './Logger';
export { Transport, setDefaultTransports } from './transport';

export function getLogger(name: string, transports?: Partial<Transport>[]): Logger {
    return new Logger(name, transports || globalTransports.transports);
}

export default Logger;
