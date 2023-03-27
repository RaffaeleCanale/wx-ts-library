export default class ReusableInterval {
    private interval?: ReturnType<typeof setInterval>;

    resetInterval(intervalTime: number, fn: () => void): void {
        this.clearInterval();
        this.interval = setInterval(fn, intervalTime);
    }

    clearInterval(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    hasInterval(): boolean {
        return !!this.interval;
    }
}
