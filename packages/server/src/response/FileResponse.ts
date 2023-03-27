import { BaseOptions, Response, withBaseOptions } from './Response';

export type FileResponse = Response & {
    __brand?: 'file';
};

export interface SendFileOptions {
    dotfiles?: 'allow' | 'deny' | 'ignore';
    root?: string;
}

export function file(
    filePath: string,
    options?: BaseOptions & SendFileOptions,
): FileResponse {
    return {
        send(res) {
            withBaseOptions(res, options, 'application/octet-stream').sendFile(
                filePath,
                options,
            );
        },
    };
}
