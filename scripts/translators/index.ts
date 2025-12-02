import { RateLimiter } from '../utils/rate-limiter';
import type { Translator, TranslatorOptions } from './types';
import { SiliconflowTranslator } from './siliconflow';

export function createTranslator(provider: string, options: TranslatorOptions): Translator {
  switch (provider) {
    case 'silicon':
    case 'siliconflow':
    case 'glm49b':
      return new SiliconflowTranslator({
        ...options,
        rateLimiter: options.rateLimiter || new RateLimiter(5000, 60_000)
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export type { Translator, TranslatorResult, TranslatorOptions } from './types';
