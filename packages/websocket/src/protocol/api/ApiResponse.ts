import { z } from 'zod';

export const ApiResponseParse = z.object({
    body: z.unknown(),
    headers: z.record(z.string()),
    status: z.number(),
});
export type ApiResponse = z.infer<typeof ApiResponseParse>;
