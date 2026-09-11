import { type Level, type Transport, fillTransportWithDefaults } from './transport.js';

export type LogContainer = {
    timestamp: string;
    name: string;
    level: string;
    message: string;
};

export default class Logger {
    private name: string;
    private transports: Transport[];

    constructor(name: string, transports: Partial<Transport>[]) {
        this.name = name;
        this.transports = transports.map(fillTransportWithDefaults);
    }

    verbose(message: string, extra?: unknown): void {
        this.log('verbose', message, extra);
    }

    info(message: string, extra?: unknown): void {
        this.log('info', message, extra);
    }

    warn(message: string, extra?: unknown): void {
        this.log('warn', message, extra);
    }

    error(message: string, extra?: unknown): void {
        this.log('error', message, extra);
    }

    log(level: Level, message: string, extra?: unknown): void {
        const levelIndex = Logger.getLevelIndex(level);

        this.transports.forEach((transport) => {
            const transportLevelIndex = Logger.getLevelIndex(transport.level);
            if (levelIndex < transportLevelIndex) {
                return;
            }
            const info: LogContainer = {
                timestamp: transport.dateFormatter(new Date()),
                name: transport.nameFormatter(this.name),
                level: transport.levelFormatter(level, levelIndex),
                message: transport.processMessage(message, extra),
            };
            transport.log(transport.messageFormatter(info), extra);
        });
    }

    private static getLevelIndex(level: Level): number {
        switch (level) {
            case 'verbose':
                return 0;
            case 'info':
                return 1;
            case 'warn':
                return 2;
            case 'error':
                return 3;
        }
    }
}
