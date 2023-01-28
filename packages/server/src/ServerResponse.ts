import type { Response } from 'express';
import type { OutgoingHttpHeaders } from 'http';

export interface BaseOptions {
    status?: number;
    headers?: OutgoingHttpHeaders;
}

export abstract class ServerResponse {
    constructor(private readonly options: BaseOptions) {}

    send(res: Response): void {
        this.doSend(
            res
                .header(this.options.headers ?? {})
                .status(this.options.status ?? 200),
        );
    }

    protected abstract doSend(res: Response): void;
}

export class JsonResponse extends ServerResponse {
    constructor(private readonly body: unknown, options: BaseOptions) {
        super({
            status: options.status,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers ?? {}),
            },
        });
    }

    protected doSend(res: Response): void {
        res.json(this.body);
    }
}

export class TextResponse extends ServerResponse {
    constructor(private readonly body: string, options: BaseOptions) {
        super({
            status: options.status,
            headers: {
                'Content-Type': 'text/plain',
                ...(options.headers ?? {}),
            },
        });
    }

    protected doSend(res: Response): void {
        res.send(this.body);
    }
}

export interface SendFileOptions {
    dotfiles?: 'allow' | 'deny' | 'ignore';
    root?: string;
}

export class FileResponse extends ServerResponse {
    constructor(
        private readonly filePath: string,
        private readonly fileOptions: BaseOptions & SendFileOptions,
    ) {
        super({
            status: fileOptions.status,
            headers: {
                'Content-Type': 'application/octet-stream',
                ...(fileOptions.headers ?? {}),
            },
        });
    }

    protected doSend(res: Response): void {
        res.sendFile(this.filePath, this.fileOptions);
    }
}
