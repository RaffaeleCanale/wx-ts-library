import Logger from './Logger';
import { globalTransports, Transport } from './transport';

export { LogContainer } from './Logger';
export { Level, Transport, setDefaultTransports } from './transport';

export function getLogger(name: string, transports?: Partial<Transport>[]): Logger {
    return new Logger(name, transports || globalTransports.transports);
}

export default Logger;
