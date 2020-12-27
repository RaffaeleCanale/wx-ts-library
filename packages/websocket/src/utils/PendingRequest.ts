export default class PendingRequest<T = unknown> {

    static reject<T>(error: Error): PendingRequest<T> {
        const request = new PendingRequest<T>();
        request.reject(error);
        return request;
    }

    private resolver!: (result: T) => void;
    private rejector!: (error: Error) => void;
    private timeout?: NodeJS.Timeout;

    public promise: Promise<T>;
    public isResolved = false;
    public isRejected = false;

    constructor(timeout?: number) {
        this.promise = new Promise((resolve, reject) => {
            this.resolver = resolve;
            this.rejector = reject;
        });

        if (timeout) {
            this.timeout = setTimeout(() => {
                this.reject(new Error('Request timed out'));
            }, timeout);
        }
    }

    resolve(result: T): void {
        this.settle();
        this.isResolved = true;
        this.resolver(result);
    }

    reject(error: Error): void {
        this.settle();
        this.isRejected = true;
        this.rejector(error);
    }

    private settle(): void {
        if (this.isRejected || this.isResolved) {
            throw new Error('Request cannot be rejected, it was already settled');
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

}