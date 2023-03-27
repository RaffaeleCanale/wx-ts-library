import { BaseOptions, Response, withBaseOptions } from './Response';

export type TextResponse = Response & {
    __brand?: 'text';
};

export function text(data: string, options?: BaseOptions): TextResponse {
    return {
        send(res) {
            withBaseOptions(res, options, 'text/plain').send(data);
        },
    };
}
