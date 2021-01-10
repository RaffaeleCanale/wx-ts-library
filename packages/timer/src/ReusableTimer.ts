import ReusableInterval from './ReusableInterval';
import ReusableTimeout from './ReusableTimeout';

export default class ReusableTimer {
    private readonly timeout = new ReusableTimeout();
    private readonly interval = new ReusableInterval();

    resetInterval(intervalTime: number, fn: () => void): void {
        this.timeout.clearTimeout();
        this.interval.resetInterval(intervalTime, fn);
    }

    resetTimeout(time: number, fn: () => void): void {
        this.interval.clearInterval();
        this.timeout.resetTimeout(time, fn);
    }

    clear(): void {
        this.interval.clearInterval();
        this.timeout.clearTimeout();
    }

    hasTimer(): boolean {
        return this.interval.hasInterval() || this.timeout.hasTimeout();
    }
}
