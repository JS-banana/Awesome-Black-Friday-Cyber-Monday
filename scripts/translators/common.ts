import type { RateLimiter } from '../utils/rate-limiter';

export function parseJsonResponse(raw: string): any {
  const trimmed = raw.trim();
  const codeFenceMatch = trimmed.match(/```json\s*([\s\S]+?)```/i);
  if (codeFenceMatch) {
    return JSON.parse(codeFenceMatch[1].trim());
  }
  return JSON.parse(trimmed);
}

export function runWithRateLimiter<T>(rateLimiter: RateLimiter | undefined, task: () => Promise<T>): Promise<T> {
  return rateLimiter ? rateLimiter.schedule(task) : task();
}
