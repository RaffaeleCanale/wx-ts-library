import { formatDate, prettyPrint } from './formatUtils.js';
import type { LogContainer } from './Logger.js';

export type Level = 'verbose' | 'info' | 'warn' | 'error';

export type Transport = {
    log: (formattedMessage: string, extra?: unknown) => void;
    processMessage: (message: string, extra?: unknown) => string;
    dateFormatter: (date: Date) => string;
    messageFormatter: (log: LogContainer) => string;
    levelFormatter: (level: string, index: number) => string;
    nameFormatter: (name: string) => string;
    level: Level;
};

const defaultTransport: Transport = {
    log: (message: string, extra?: unknown) =>
        // eslint-disable-next-line no-console
        console.log(message, prettyPrint(extra)),
    processMessage: (message: string) => message,
    dateFormatter: formatDate,
    messageFormatter: (info) => `${info.timestamp} ${info.level} [${info.name}] - ${info.message}`,
    levelFormatter: (level) => {
        return level.substring(0, 4).toUpperCase();
    },
    nameFormatter: (name) => name,
    level: 'verbose',
};

export const globalTransports = {
    defaultTransport,
    transports: [defaultTransport],
};

export function setDefaultTransports(transports: Transport[]): void {
    globalTransports.transports = transports;
}

export function fillTransportWithDefaults(transport: Partial<Transport>): Transport {
    return {
        ...defaultTransport,
        ...transport,
    };
}
