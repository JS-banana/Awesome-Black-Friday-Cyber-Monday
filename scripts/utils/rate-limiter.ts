import { delay } from './async';

export class RateLimiter {
  private readonly intervalMs: number;
  private readonly limit: number;
  private readonly timestamps: number[] = [];
  private queue: Promise<void> = Promise.resolve();

  constructor(maxRequests: number, intervalMs: number) {
    if (maxRequests <= 0) {
      throw new Error('RateLimiter requires maxRequests > 0');
    }
    if (intervalMs <= 0) {
      throw new Error('RateLimiter requires intervalMs > 0');
    }
    this.limit = maxRequests;
    this.intervalMs = intervalMs;
  }

  schedule<T>(task: () => Promise<T>): Promise<T> {
    const scheduled = this.queue.then(() => this.waitForSlot()).then(task);
    this.queue = scheduled.then(
      () => undefined,
      () => undefined
    );
    return scheduled;
  }

  private async waitForSlot(): Promise<void> {
    while (true) {
      const now = Date.now();
      this.prune(now);
      if (this.timestamps.length < this.limit) {
        this.timestamps.push(now);
        return;
      }
      const waitTime = this.intervalMs - (now - this.timestamps[0]);
      await delay(Math.max(waitTime, 0));
    }
  }

  private prune(now: number) {
    while (this.timestamps.length && now - this.timestamps[0] >= this.intervalMs) {
      this.timestamps.shift();
    }
  }
}
