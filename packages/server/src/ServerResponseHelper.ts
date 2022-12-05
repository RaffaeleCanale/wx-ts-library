import {
    BaseOptions,
    FileResponse,
    JsonResponse,
    SendFileOptions,
    ServerResponse,
    TextResponse,
} from './ServerResponse';

export function text(text: string, options: BaseOptions = {}): ServerResponse {
    return new TextResponse(text, options);
}

export function json(body: unknown, options: BaseOptions = {}): ServerResponse {
    return new JsonResponse(body, options);
}

export function file(
    filePath: string,
    options: BaseOptions & SendFileOptions = {},
): ServerResponse {
    return new FileResponse(filePath, options);
}
