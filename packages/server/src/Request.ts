import type { Request as ExpressRequest } from 'express';
import type { IncomingHttpHeaders } from 'http';
import type { z } from 'zod';

export class Request<Params = Record<string, string>> {
    static fromExpress(req: ExpressRequest): Request {
        function normalizedQuery(): Record<string, string[]> {
            const query: Record<string, string[]> = {};

            Object.entries(req.query).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    query[key] = [value];
                } else if (value === undefined) {
                    query[key] = [];
                } else {
                    query[key] = value as string[];
                }
            });

            return query;
        }

        return new Request(
            req.body,
            normalizedQuery(),
            req.params,
            req.headers,
        );
    }

    constructor(
        private readonly bodyValue: unknown,
        private readonly queryValue: Record<string, string[]>,
        private readonly paramsValue: Params,
        private readonly headersValue: IncomingHttpHeaders,
    ) {}

    body(): unknown;
    body<T>(validator: z.ZodType<T>): T;
    body<T>(validator?: z.ZodType<T>): T {
        if (!validator) {
            return this.bodyValue as T;
        }
        return validator.parse(this.bodyValue);
    }

    query(): Record<string, string[]>;
    query<T>(validator: z.ZodType<T>): T;
    query<T>(validator?: z.ZodType<T>): T {
        if (!validator) {
            return this.queryValue as T;
        }
        return validator.parse(this.queryValue);
    }

    params() {
        return this.paramsValue;
    }

    headers(): IncomingHttpHeaders {
        return this.headersValue;
    }
}
