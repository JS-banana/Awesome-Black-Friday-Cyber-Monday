import type { RateLimiter } from '../utils/rate-limiter';
import type { TranslationTask } from '../translation-core';

export interface TranslatorResult {
  task: TranslationTask;
  translated: string | string[];
}

export interface TranslatorOptions {
  locale: string;
  prompt: string;
  batchSize: number;
  throttleMs: number;
  maxRetries: number;
  retryDelayMs: number;
  modelId?: string;
  requestTimeoutMs: number;
  rateLimiter?: RateLimiter;
}

export interface Translator {
  translate(tasks: TranslationTask[]): Promise<TranslatorResult[]>;
}
