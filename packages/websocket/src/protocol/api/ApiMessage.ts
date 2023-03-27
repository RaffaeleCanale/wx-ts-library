import { z } from 'zod';

export const ApiMessageParse = z.object({
    path: z.string(),
    method: z.union([
        z.literal('get'),
        z.literal('post'),
        z.literal('put'),
        z.literal('patch'),
        z.literal('delete'),
    ]),
    body: z.unknown(),
    query: z.record(z.array(z.string())),
    headers: z.record(z.string()),
});
export type ApiMessage = z.infer<typeof ApiMessageParse>;
