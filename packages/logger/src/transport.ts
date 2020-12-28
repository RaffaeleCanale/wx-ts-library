import { formatDate, prettyPrint } from './formatUtils';
import { LogContainer } from './Logger';

export enum Level {
    VERBOSE = 'verbose',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface Transport {
    log: (formattedMessage: string, extra?: any) => void;
    processMessage: (message: string, extra?: any) => string;
    dateFormatter: (date: Date) => string;
    messageFormatter: (log: LogContainer) => string;
    levelFormatter: (level: string, index: number) => string;
    nameFormatter: (name: string) => string;
    level: Level;
}

const defaultTransport: Transport = {
    // eslint-disable-next-line no-console
    log: (message: string, extra?: any) => console.log(message, prettyPrint(extra)),
    processMessage: (message: string) => message,
    dateFormatter: formatDate,
    messageFormatter: (info) => `${info.timestamp} ${info.level} [${info.name}] - ${info.message}`,
    levelFormatter: (level) => {
        return level.substring(0, 4).toUpperCase();
    },
    nameFormatter: (name) => name,
    level: Level.VERBOSE,
};


export const globalTransports = {
    defaultTransport,
    transports: [defaultTransport] as Partial<Transport>[],
};

export function setDefaultTransports(transports: Partial<Transport>[]): void {
    globalTransports.transports = transports;
}

export function fillTransportWithDefaults(transport: Partial<Transport>): Transport {
    return {
        ...defaultTransport,
        ...transport,
    };
}
