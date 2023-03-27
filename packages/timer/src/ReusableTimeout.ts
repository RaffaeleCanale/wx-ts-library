export default class ReusableTimeout {
    private timeout?: ReturnType<typeof setTimeout>;

    resetTimeout(time: number, fn: () => void): void {
        this.clearTimeout();
        this.timeout = setTimeout(() => {
            this.timeout = undefined;
            fn();
        }, time);
    }

    clearTimeout(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    hasTimeout(): boolean {
        return !!this.timeout;
    }
}
