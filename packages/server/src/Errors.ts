export class ApiError extends Error {
    constructor(message: string, public readonly statusCode: number) {
        super(message);
    }
}

export class NotFound extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

export class ValidationError extends ApiError {
    constructor(message = 'Validation error') {
        super(message, 400);
    }
}
