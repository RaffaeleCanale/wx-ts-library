import { BaseOptions, Response, withBaseOptions } from './Response';

export type Json<T> = Response & {
    __brand?: T;
};

export function json<T>(data: T, options?: BaseOptions): Json<T> {
    return {
        send(res) {
            withBaseOptions(res, options, 'application/json').json(data);
        },
    };
}
