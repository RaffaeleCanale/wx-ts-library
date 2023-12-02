import type { OutgoingHttpHeaders } from 'http';
import type { Data } from './DataResponse.js';
import type { File } from './FileResponse.js';
import type { Json } from './JsonResponse.js';
import type { Text } from './TextResponse.js';

export interface BaseOptions {
    status?: number;
    headers?: OutgoingHttpHeaders;
}

export type Response<T = unknown> = Json<T> | Text | File | Data;
