import type { OutgoingHttpHeaders } from 'http';
import type { Data } from './DataResponse';
import type { File } from './FileResponse';
import type { Json } from './JsonResponse';
import type { Text } from './TextResponse';

export interface BaseOptions {
    status?: number;
    headers?: OutgoingHttpHeaders;
}

export type Response<T = unknown> = Json<T> | Text | File | Data;
