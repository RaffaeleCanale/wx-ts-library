import type { OutgoingHttpHeaders } from 'http';
import { File } from './FileResponse';
import { Json } from './JsonResponse';
import { Text } from './TextResponse';

export interface BaseOptions {
    status?: number;
    headers?: OutgoingHttpHeaders;
}

export type Response<T = unknown> = Json<T> | Text | File;
