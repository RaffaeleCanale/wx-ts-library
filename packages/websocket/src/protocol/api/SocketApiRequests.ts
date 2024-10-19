import type { ApiMessage } from './ApiMessage.js';

type RequestOptions = Partial<Pick<ApiMessage, 'headers' | 'query'>>;

export const SocketApiRequest = {
    get(path: string, options: RequestOptions = {}): ApiMessage {
        return {
            path,
            method: 'get',
            body: {},
            query: options.query ?? {},
            headers: options.headers ?? {},
        };
    },

    post(
        path: string,
        body: unknown,
        options: RequestOptions = {},
    ): ApiMessage {
        return {
            path,
            method: 'post',
            body,
            query: options.query ?? {},
            headers: options.headers ?? {},
        };
    },

    put(path: string, body: unknown, options: RequestOptions = {}): ApiMessage {
        return {
            path,
            method: 'put',
            body,
            query: options.query ?? {},
            headers: options.headers ?? {},
        };
    },

    patch(
        path: string,
        body: unknown,
        options: RequestOptions = {},
    ): ApiMessage {
        return {
            path,
            method: 'patch',
            body,
            query: options.query ?? {},
            headers: options.headers ?? {},
        };
    },

    delete(path: string, options: RequestOptions = {}): ApiMessage {
        return {
            path,
            method: 'delete',
            body: {},
            query: options.query ?? {},
            headers: options.headers ?? {},
        };
    },
};
