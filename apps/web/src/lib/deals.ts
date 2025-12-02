import { readFileSync } from "node:fs";
import path from "node:path";

import slugify from "@sindresorhus/slugify";

import type { Deal, DealsDataset, TranslationDataset } from "@awesome-bfcm/deals-schema";
import type { Locale } from "@/i18n/routing";

const ROOT_DIR = path.resolve(process.cwd(), "..", "..");
const DATA_DIR = path.join(ROOT_DIR, "data");

function loadDataset<T>(fileName: string): T {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

const englishDataset = loadDataset<DealsDataset>("deals.en.json");
const zhDataset = loadDataset<TranslationDataset>("deals.zh.json");

const english = englishDataset as DealsDataset;
const zh = zhDataset as TranslationDataset;
const locales: Locale[] = ["en", "zh"];
const categoryNameByLocale: Record<Locale, Map<string, string>> = {
  en: new Map(),
  zh: new Map()
};

export interface LocalizedFields {
  name: string;
  description?: string;
  terms?: string;
  tags: string[];
  categoryLabels: string[];
}

export interface DealRecord extends Deal {
  locales: Record<Locale, LocalizedFields>;
}

export interface CategoryNode {
  name: string;
  slug: string;
  path: string[];
  count: number;
  children: CategoryNode[];
}

const dealRecords: DealRecord[] = english.deals.map((deal) => {
  const entry = zh.entries[deal.id];
  const tags = deal.tags ?? [];

  const getString = (field: keyof typeof entry) => {
    const value = entry?.[field]?.value;
    return typeof value === "string" ? value : undefined;
  };

  const getTags = () => {
    const value = entry?.tags?.value;
    if (!value) return undefined;
    return Array.isArray(value) ? value : String(value).split(/[，,]+/).map((v) => v.trim()).filter(Boolean);
  };

  const zhTags = getTags() ?? tags;
  const zhCategoryLabels = buildLocalizedCategoryLabels(deal.categoryPath, zhTags, tags);

  registerCategoryNames(deal.categoryPath, deal.categoryPath, "en");
  registerCategoryNames(deal.categoryPath, zhCategoryLabels, "zh");

  const zhFields: LocalizedFields = {
    name: getString("name") ?? deal.name,
    description: getString("description") ?? deal.description,
    terms: getString("terms") ?? deal.terms,
    tags: zhTags,
    categoryLabels: zhCategoryLabels
  };

  return {
    ...deal,
    locales: {
      en: {
        name: deal.name,
        description: deal.description,
        terms: deal.terms,
        tags,
        categoryLabels: deal.categoryPath
      },
      zh: zhFields
    }
  } satisfies DealRecord;
});

function registerCategoryNames(categoryPath: string[], labels: string[], locale: Locale) {
  const acc: string[] = [];
  categoryPath.forEach((segment, index) => {
    acc.push(segment);
    const slug = slugify(acc.join("-"));
    const label = labels[index];
    if (label) {
      categoryNameByLocale[locale].set(slug, label);
    }
  });
}

function buildLocalizedCategoryLabels(categoryPath: string[], localizedTags: string[], fallbackTags: string[]) {
  return categoryPath.map((segment, index) => {
    const translation = localizedTags[index];
    const fallbackTag = fallbackTags[index];
    if (!translation || (fallbackTag && translation.toLowerCase() === fallbackTag.toLowerCase())) {
      return segment;
    }
    return mergeEmoji(segment, translation);
  });
}

function mergeEmoji(original: string, translation: string) {
  const iconPrefix = original.match(/^[^A-Za-z0-9]+/);
  if (iconPrefix) {
    return `${iconPrefix[0].trim()} ${translation}`.trim();
  }
  return translation;
}

interface InternalNode {
  name: string;
  slug: string;
  path: string[];
  count: number;
  children: InternalNode[];
  map: Map<string, InternalNode>;
}

const root: InternalNode = {
  name: "root",
  slug: "root",
  path: [],
  count: 0,
  children: [],
  map: new Map()
};

const categorySlugToPath = new Map<string, string[]>();

for (const deal of dealRecords) {
  let current = root;
  for (const segment of deal.categoryPath) {
    const key = segment.trim();
    let child = current.map.get(key);
    if (!child) {
      const path = [...current.path, key];
      const slug = slugify(path.join("-"));
      child = {
        name: key,
        slug,
        path,
        count: 0,
        children: [],
        map: new Map()
      };
      current.map.set(key, child);
      current.children.push(child);
      categorySlugToPath.set(slug, path);
    }
    child.count += 1;
    current = child;
  }
}

function stripNode(node: InternalNode, locale: Locale): CategoryNode {
  return {
    name: categoryNameByLocale[locale].get(node.slug) ?? node.name,
    slug: node.slug,
    path: node.path,
    count: node.count,
    children: node.children.map((child) => stripNode(child, locale))
  };
}

export function getDealRecords(): DealRecord[] {
  return dealRecords;
}

export function getLocalizedDeals(locale: Locale): Array<Deal & LocalizedFields> {
  return dealRecords.map((deal) => {
    const fields = deal.locales[locale];
    return {
      ...deal,
      name: fields.name,
      description: fields.description,
      terms: fields.terms,
      tags: fields.tags,
      categoryLabels: fields.categoryLabels
    };
  });
}

export function getCategoryTree(locale: Locale): CategoryNode[] {
  return root.children.map((child) => stripNode(child, locale));
}

export function getCategoryPathBySlug(slug: string): string[] | undefined {
  return categorySlugToPath.get(slug);
}

export function getDealsByCategorySlug(slug: string, locale: Locale) {
  const path = getCategoryPathBySlug(slug);
  if (!path) return [];
  return getLocalizedDeals(locale).filter((deal) => path.every((segment, idx) => deal.categoryPath[idx] === segment));
}

export function getFeaturedDeals(locale: Locale, limit = 8) {
  const localized = getLocalizedDeals(locale);
  const sorted = [...localized].sort((a, b) => {
    const score = (deal: Deal & LocalizedFields) => Number(Boolean(deal.discount)) + Number(Boolean(deal.code));
    return score(b) - score(a);
  });
  return sorted.slice(0, limit);
}

export function getDatasetMeta() {
  return {
    total: english.total,
    generatedAt: english.generatedAt,
    sourceHash: english.source.hash
  };
}

export { locales };
