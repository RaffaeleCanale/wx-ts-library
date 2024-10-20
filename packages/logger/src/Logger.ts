import {
    Level,
    type Transport,
    fillTransportWithDefaults,
} from './transport.js';

export interface LogContainer {
    timestamp: string;
    name: string;
    level: string;
    message: string;
}

export default class Logger {
    private name: string;
    private transports: Transport[];

    constructor(name: string, transports: Partial<Transport>[]) {
        this.name = name;
        this.transports = transports.map(fillTransportWithDefaults);
    }

    verbose(message: string, extra?: unknown): void {
        this.log(Level.VERBOSE, message, extra);
    }

    info(message: string, extra?: unknown): void {
        this.log(Level.INFO, message, extra);
    }

    warn(message: string, extra?: unknown): void {
        this.log(Level.WARN, message, extra);
    }

    error(message: string, extra?: unknown): void {
        this.log(Level.ERROR, message, extra);
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
        const index = Object.values(Level).indexOf(level);
        if (index < 0) {
            throw new Error(`Level ${level} not found`);
        }

        return index;
    }
}
