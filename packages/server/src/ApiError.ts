import { ZodError } from 'zod';

export class ApiError extends Error {
    static get NotFound() {
        return NotFound;
    }
    static get BadRequest() {
        return BadRequest;
    }
    static get ServerError() {
        return ServerError;
    }

    static from(error: unknown): ApiError {
        if (error instanceof ApiError) {
            return error;
        }
        if (error instanceof ZodError) {
            return new BadRequest(error.message);
        }

        const detail = error instanceof Error ? error.message : String(error);

        return new ServerError(detail);
    }

    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly detail?: string,
    ) {
        super(message);
    }

    toJson() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            detail: this.detail,
        };
    }
}

class NotFound extends ApiError {
    constructor(detail?: string) {
        super('Resource not found', 404, detail);
    }
}

class BadRequest extends ApiError {
    constructor(detail?: string) {
        super('Bad request', 400, detail);
    }
}

class ServerError extends ApiError {
    constructor(detail?: string) {
        super('Server error', 500, detail);
    }
}
