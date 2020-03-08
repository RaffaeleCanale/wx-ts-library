function prettyPrint(value: any): string {
    if (Array.isArray(value)) {
        return `[${value.map(prettyPrint).join(', ')}]`;
    }
    return JSON.stringify(value);
}

function formatDate(date: Date): string {
    const pad = (num: number): string => {
        const norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + norm;
    };
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

enum LEVEL {
    VERBOSE = 'verbose',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

interface LogContainer {
    timestamp: string;
    name: string;
    level: string;
    message: string;
}

interface Transport {
    log: (...args: any[]) => void;
    processMessage: (...args: any[]) => string;
    dateFormatter: (date: Date) => string;
    messageFormatter: (log: LogContainer) => string;
    levelFormatter: (level: string, index: number) => string;
    nameFormatter: (name: string) => string;
    level: LEVEL;
}

const defaultTransport: Transport = {
    log: console.log,
    processMessage: (...message) => message.map(prettyPrint).join(' '),
    dateFormatter: formatDate,
    messageFormatter: (info) => `${info.timestamp} ${info.level} [${info.name}] - ${info.message}`,
    levelFormatter: (level, index) => {
        return level.substring(0, 4).toUpperCase();
    },
    nameFormatter: (name) => name,
    level: LEVEL.VERBOSE,
};

class Logger {

    private name: string;
    private transports: Transport[];

    constructor(name: string, transports: Transport[]) {
        this.name = name;
        this.transports = transports.map((transport) => {
            const options = {
                ...defaultTransport,
                ...transport,
            };
            return options;
        });
    }

    verbose(...message: any[]): void {
        this.log(LEVEL.VERBOSE, ...message);
    }

    info(...message: any[]): void {
        this.log(LEVEL.INFO, ...message);
    }

    warn(...message: any[]): void {
        this.log(LEVEL.WARN, ...message);
    }

    error(...message: any[]): void {
        this.log(LEVEL.ERROR, ...message);
    }

    log(level: LEVEL, ...message: any[]): void {
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
                message: transport.processMessage(...message),
            };
            transport.log(transport.messageFormatter(info));
        });
    }

    private static getLevelIndex(level: LEVEL): number {
        const index = Object.values(LEVEL).indexOf(level);
        if (index < 0) {
            throw new Error(`Level ${level} not found`);
        }

        return index;
    }
}

let globalTransports = [defaultTransport];

export function setDefaultTransports(transports: Transport[]): void {
    globalTransports = transports;
}

export function getLogger(name: string, transports?: Transport[]): Logger {
    return new Logger(name, transports || globalTransports);
}

export default Logger;
