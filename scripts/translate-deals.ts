import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { config as loadEnv } from 'dotenv';

import { Command } from 'commander';
import pLimit from 'p-limit';

import type { DealsDataset, TranslationDataset } from '@awesome-bfcm/deals-schema';

import {
  applyTranslation,
  collectTranslationTasks,
  chunkArray,
  type Overrides
} from './translation-core';
import { createTranslator } from './translators';
import { delay } from './utils/async';

const ROOT = path.resolve(process.cwd());
const DATA_DIR = path.resolve(ROOT, 'data');
const ZH_PATH = path.resolve(DATA_DIR, 'deals.zh.json');
const EN_PATH = path.resolve(DATA_DIR, 'deals.en.json');
const OVERRIDES_PATH = path.resolve(DATA_DIR, 'translations_overrides.zh.json');
const PROMPT_PATH = path.resolve(ROOT, 'translation_agent.md');
const ENV_PATH = path.resolve(ROOT, '.env.local');

loadEnv({ path: ENV_PATH, override: false });

async function main() {
  const program = new Command();
  program
    .option(
      '--provider <provider>',
      'translation provider (siliconflow|silicon|glm49b)',
      'siliconflow'
    )
    .option('--locale <locale>', 'target locale', 'zh')
    .option('--dry-run', 'list work without persisting changes')
    .option('--list-stale', 'list untranslated/stale fields and exit')
    .option('--limit <number>', 'maximum number of fields to translate', (value) => parseInt(value, 10))
    .option('--concurrency <number>', 'parallel translation requests', (value) => parseInt(value, 10), 1)
    .option('--batch-size <number>', 'number of fields per provider request', (value) => parseInt(value, 10), 12)
    .option('--throttle <number>', 'delay in ms between provider calls', (value) => parseInt(value, 10), 4000)
    .option('--max-retries <number>', 'maximum retries per provider request', (value) => parseInt(value, 10), 5)
    .option('--retry-delay <number>', 'base delay in ms for retries', (value) => parseInt(value, 10), 2500)
    .option('--flush-cache', 'clear cached translations before running', false)
    .option('--model-id <modelId>', 'override model ID for remote providers')
    .option('--request-timeout <number>', 'per-request timeout in ms (capped at 20000ms)', (value) => parseInt(value, 10), 20000)
    .option('--single-pass', 'run only one translation pass and exit', false)
    .option('--loop-delay <number>', 'delay between automatic passes in ms', (value) => parseInt(value, 10), 5000)
    .parse(process.argv);

  const options = program.opts<{
    provider: string;
    locale: string;
    dryRun?: boolean;
    listStale?: boolean;
    limit?: number;
    concurrency: number;
    batchSize: number;
    throttle: number;
    maxRetries: number;
    retryDelay: number;
    flushCache?: boolean;
    modelId?: string;
    requestTimeout: number;
    singlePass?: boolean;
    loopDelay: number;
  }>();

  const english = await readJson<DealsDataset>(EN_PATH);
  const overrides = await readJson<Overrides>(OVERRIDES_PATH).catch(() => ({}));
  const translatorPrompt = await readFile(PROMPT_PATH, 'utf8');
  const cache = await readJson<TranslationDataset>(ZH_PATH).catch(() => ({
    locale: options.locale,
    updatedAt: new Date().toISOString(),
    entries: {}
  } satisfies TranslationDataset));

  if (cache.locale !== options.locale) {
    cache.locale = options.locale;
  }

  if (options.flushCache) {
    cache.entries = {};
    cache.updatedAt = new Date().toISOString();
  }

  const translator = createTranslator(options.provider, {
    locale: options.locale,
    prompt: translatorPrompt,
    batchSize: options.batchSize,
    throttleMs: Math.max(0, options.throttle ?? 0),
    maxRetries: Math.max(1, options.maxRetries ?? 1),
    retryDelayMs: Math.max(500, options.retryDelay ?? 500),
    modelId: options.modelId,
    requestTimeoutMs: Math.min(20000, Math.max(1000, options.requestTimeout ?? 20000))
  });

  const shouldLoop = !options.singlePass;
  const loopDelayMs = Math.max(1000, options.loopDelay ?? 5000);
  let round = 1;

  while (true) {
    const { remaining } = await runRound(round);
    if (options.listStale || options.dryRun) {
      break;
    }
    if (!shouldLoop || remaining <= 0) {
      break;
    }
    console.log(`Waiting ${loopDelayMs}ms before next pass (about ${remaining} field(s) pending)...`);
    await delay(loopDelayMs);
    round += 1;
  }

  async function runRound(roundNumber: number): Promise<{ remaining: number }> {
    const tasks = collectTranslationTasks(english.deals, overrides, cache);

    if (tasks.length === 0) {
      if (!options.listStale) {
        await persistCache(cache);
        const msg = roundNumber === 1
          ? 'All translations are up to date (after applying overrides).'
          : 'No pending translations remaining.';
        console.log(msg);
      } else {
        console.log('No stale fields found.');
      }
      return { remaining: 0 };
    }

    if (options.listStale || options.dryRun) {
      tasks.forEach((task) => {
        console.log(`${task.field.padEnd(12)} ${task.dealId}`);
      });
      console.log(`${tasks.length} field(s) pending translation.`);
      if (!options.listStale && options.dryRun) {
        console.log('Dry run: skipping provider calls.');
      }
      return { remaining: tasks.length };
    }

    const limitedTasks = typeof options.limit === 'number' ? tasks.slice(0, options.limit) : tasks;
    if (limitedTasks.length === 0) {
      console.log('No tasks selected for this round (limit resolved to 0).');
      return { remaining: tasks.length };
    }

    console.log(
      `[Round ${roundNumber}] Pending ${tasks.length} field(s); processing ${limitedTasks.length} this pass.`
    );

    const chunked = chunkArray(limitedTasks, options.batchSize).filter((chunk) => chunk.length);
    const limitExecutor = pLimit(Math.max(1, options.concurrency));
    let processedCount = 0;

    await Promise.all(
      chunked.map((chunk, index) =>
        limitExecutor(async () => {
          try {
            const results = await translator.translate(chunk);
            const completed = new Set(results.map(({ task }) => `${task.dealId}:${task.field}`));
            if (completed.size < chunk.length) {
              chunk.forEach((task) => {
                if (!completed.has(`${task.dealId}:${task.field}`)) {
                  console.warn(
                    `[Round ${roundNumber}] Missing translation for ${task.dealId}:${task.field}; will retry later.`
                  );
                }
              });
            }
            results.forEach(({ task, translated }) => {
              applyTranslation(cache, task.dealId, task.field, translated, task.sourceHash, task.isList);
            });
            processedCount += results.length;
            console.log(
              `[Round ${roundNumber}] Chunk ${index + 1}/${chunked.length} processed ${results.length}/${chunk.length} field(s).`
            );
          } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            console.error(
              `[Round ${roundNumber}] Chunk ${index + 1}/${chunked.length} failed (${reason}). Pending tasks will retry later.`
            );
          }
        })
      )
    );

    if (processedCount > 0) {
      cache.updatedAt = new Date().toISOString();
      await persistCache(cache);
    }

    const remaining = Math.max(tasks.length - processedCount, 0);
    console.log(`[Round ${roundNumber}] Completed ${processedCount} field(s). Remaining pending: ${remaining}.`);
    return { remaining };
  }
}

async function persistCache(cache: TranslationDataset) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ZH_PATH, JSON.stringify(cache, null, 2) + '\n', 'utf8');
}

async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
