import { createHash } from 'node:crypto';

import type {
  Deal,
  DealTranslationEntry,
  FieldTranslation,
  TranslationDataset
} from '@awesome-bfcm/deals-schema';

export type FieldKey = 'name' | 'description' | 'terms' | 'tags';

export interface TranslationTask {
  dealId: string;
  dealName: string;
  categoryPath: string[];
  field: FieldKey;
  text: string;
  sourceHash: string;
  isList: boolean;
}

export interface OverridesEntry {
  name?: string;
  description?: string;
  terms?: string;
  tags?: string[];
}

export type Overrides = Record<string, OverridesEntry>;

export function collectTranslationTasks(
  deals: Deal[],
  overrides: Overrides,
  cache: TranslationDataset
): TranslationTask[] {
  const tasks: TranslationTask[] = [];
  for (const deal of deals) {
    buildDealTasks(deal, overrides, cache, tasks);
  }
  return tasks;
}

export function buildDealTasks(
  deal: Deal,
  overrides: Overrides,
  cache: TranslationDataset,
  tasks: TranslationTask[]
) {
  const dealOverrides = overrides[deal.id];
  const entry = (cache.entries[deal.id] ||= {});

  for (const field of ['name', 'description', 'terms', 'tags'] as FieldKey[]) {
    const englishValue = getFieldValue(deal, field);
    if (englishValue === undefined) continue;

    const sourceHash = hashField(englishValue);
    const overrideValue = getOverrideValue(dealOverrides, field);
    if (overrideValue !== undefined) {
      applyTranslation(cache, deal.id, field, overrideValue, sourceHash, Array.isArray(overrideValue));
      continue;
    }

    const cachedField = entry[field];
    if (cachedField && cachedField.sourceHash === sourceHash) {
      continue;
    }

    tasks.push({
      dealId: deal.id,
      dealName: deal.name,
      categoryPath: deal.categoryPath,
      field,
      text: normalizeForTranslation(englishValue, field),
      sourceHash,
      isList: field === 'tags'
    });
  }
}

function getFieldValue(deal: Deal, field: FieldKey): string | string[] | undefined {
  switch (field) {
    case 'name':
      return deal.name;
    case 'description':
      return deal.description;
    case 'terms':
      return deal.terms;
    case 'tags':
      return deal.tags && deal.tags.length ? deal.tags : undefined;
    default:
      return undefined;
  }
}

function getOverrideValue(overrides: OverridesEntry | undefined, field: FieldKey) {
  if (!overrides) return undefined;
  return overrides[field];
}

export function hashField(value: string | string[]): string {
  const normalized = Array.isArray(value) ? value.join('|') : value;
  return createHash('sha1').update(normalized).digest('hex');
}

export function normalizeForTranslation(value: string | string[], field: FieldKey): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (field === 'terms') {
    return value.replace(/\s+/g, ' ').trim();
  }
  return value;
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function applyTranslation(
  cache: TranslationDataset,
  dealId: string,
  field: FieldKey,
  translated: string | string[],
  sourceHash: string,
  isList: boolean
) {
  const entry: DealTranslationEntry = (cache.entries[dealId] ||= {});
  const value = isList ? ensureArray(translated) : (Array.isArray(translated) ? translated.join(', ') : translated);
  const finalValue = isList ? ensureArray(value) : (value as string);

  entry[field] = {
    value: finalValue,
    sourceHash,
    translatedAt: new Date().toISOString()
  } satisfies FieldTranslation;
}

export function ensureArray(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  return value
    .split(/[，,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
