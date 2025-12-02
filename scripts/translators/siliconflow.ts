import { ensureArray } from '../translation-core';
import { requestWithTimeout } from '../utils/async';
import { parseJsonResponse, runWithRateLimiter } from './common';
import type { Translator, TranslatorOptions, TranslatorResult } from './types';
import type { TranslationTask } from '../translation-core';

const DEFAULT_ENDPOINT = 'https://api.siliconflow.cn/v1/chat/completions';
const DEFAULT_MODEL = 'THUDM/GLM-4-9B-0414';

export class SiliconflowTranslator implements Translator {
  private readonly apiKey =
    process.env.Siliconflow_API_KEY ||
    process.env.SILICONFLOW_API_KEY ||
    process.env.SILICONFLOW_APIKEY ||
    process.env.SILICON_API_KEY;

  private readonly modelId: string;

  constructor(private readonly options: TranslatorOptions) {
    if (!this.apiKey) {
      throw new Error('Siliconflow_API_KEY is required for the siliconflow provider.');
    }
    this.modelId = options.modelId || DEFAULT_MODEL;
  }

  async translate(tasks: TranslationTask[]): Promise<TranslatorResult[]> {
    if (!tasks.length) return [];
    const results = await runWithRateLimiter(this.options.rateLimiter, () => this.performRequest(tasks));
    if (this.options.throttleMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.options.throttleMs));
    }
    return results;
  }

  private async performRequest(tasks: TranslationTask[]): Promise<TranslatorResult[]> {
    const payload = {
      model: this.modelId,
      messages: [
        {
          role: 'system',
          content:
            `${this.options.prompt}\n\nRespond strictly with JSON shaped as {"translations":[{"dealId":"...","field":"name","value":"...","isList":false}]}. ` +
            'Do not add explanations. Keep brand names and discount codes intact.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            locale: this.options.locale,
            tasks: tasks.map((task) => ({
              id: task.dealId,
              field: task.field,
              dealName: task.dealName,
              categoryPath: task.categoryPath,
              source: task.text,
              isList: task.isList
            }))
          })
        }
      ],
      temperature: 0.2,
      top_p: 0.9
    };

    const { response, bodyText } = await requestWithTimeout(
      DEFAULT_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      },
      this.options.requestTimeoutMs
    );

    if (!response.ok) {
      throw new Error(`Siliconflow API error: ${response.status} ${response.statusText}: ${bodyText}`);
    }

    let data: { choices?: { message?: { content?: string } }[] };
    try {
      data = JSON.parse(bodyText) as { choices?: { message?: { content?: string } }[] };
    } catch (error) {
      throw new Error(`Siliconflow response parse error: ${error instanceof Error ? error.message : bodyText}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Siliconflow API returned empty content.');
    }

    const json = parseJsonResponse(content);
    const translations = Array.isArray(json?.translations) ? json.translations : [];
    if (!translations.length) {
      throw new Error('Siliconflow API returned no translations.');
    }

    const taskMap = new Map<string, TranslationTask>();
    tasks.forEach((task) => taskMap.set(`${task.dealId}:${task.field}`, task));

    return translations.map((entry: any) => {
      const task = taskMap.get(`${entry.dealId}:${entry.field}`);
      if (!task) {
        throw new Error(`Unexpected translation entry for ${entry.dealId}:${entry.field}`);
      }
      const value = entry.value;
      const translated = task.isList ? ensureArray(value) : value;
      return { task, translated } satisfies TranslatorResult;
    });
  }
}
