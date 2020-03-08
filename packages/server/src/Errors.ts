/* eslint-disable max-classes-per-file */
export class NotFound extends Error {
    httpCode = 404;

    constructor(message = 'Resource not found') {
        super(message);
    }
}

export class ValidationError extends Error {
    httpCode = 400;
}
