import { ApiMessage } from './SocketApiHandler';

type dict = { [name: string]: string };

export function createGetRequest(path: string, headers: dict = {}, query: dict = {}): ApiMessage {
    return {
        path,
        method: 'get',
        body: {},
        query,
        headers,
    };
}

export function createPostRequest(
    path: string,
    body: any,
    headers: dict = {},
    query: dict = {},
): ApiMessage {
    return {
        path,
        method: 'post',
        body,
        query,
        headers,
    };
}

export function createPutRequest(
    path: string,
    body: any,
    headers: dict = {},
    query: dict = {},
): ApiMessage {
    return {
        path,
        method: 'put',
        body,
        query,
        headers,
    };
}

export function createPatchRequest(
    path: string,
    body: any,
    headers: dict = {},
    query: dict = {},
): ApiMessage {
    return {
        path,
        method: 'patch',
        body,
        query,
        headers,
    };
}

export function createDeleteRequest(
    path: string,
    headers: dict = {},
    query: dict = {},
): ApiMessage {
    return {
        path,
        method: 'delete',
        body: {},
        query,
        headers,
    };
}
