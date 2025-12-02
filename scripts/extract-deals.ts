import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import slugify from '@sindresorhus/slugify';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit, EXIT } from 'unist-util-visit';

import type { Deal, DealsDataset } from '@awesome-bfcm/deals-schema';
import type { Heading, Link, Table, TableCell } from 'mdast';

const ROOT = path.resolve(process.cwd());
const README_PATH = path.resolve(ROOT, 'README-origin.md');
const DATA_DIR = path.resolve(ROOT, 'data');
const CACHE_DIR = path.resolve(ROOT, '.cache');
const OUTPUT_PATH = path.resolve(DATA_DIR, 'deals.en.json');
const README_HASH_PATH = path.resolve(CACHE_DIR, 'README.sha1');

const MIN_HEADING_DEPTH = 2;
const MAX_HEADING_DEPTH = 4;

type HeadingMap = Map<number, string>;

async function main() {
  await Promise.all([mkdir(DATA_DIR, { recursive: true }), mkdir(CACHE_DIR, { recursive: true })]);

  const markdown = await readFile(README_PATH, 'utf8');
  const sourceHash = createHash('sha1').update(markdown).digest('hex');

  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  const headingMap: HeadingMap = new Map();
  const deals: Deal[] = [];

  visit(tree, (node) => {
    if (isHeading(node) && node.depth >= MIN_HEADING_DEPTH && node.depth <= MAX_HEADING_DEPTH) {
      updateHeadingMap(headingMap, node.depth, toHeadingText(node));
      return;
    }

    if (node.type === 'table') {
      const categoryPath = buildCategoryPath(headingMap);
      if (!categoryPath.length) return;
      const parsed = parseTable(node as Table, categoryPath);
      deals.push(...parsed);
    }
  });

  const dataset: DealsDataset = {
    generatedAt: new Date().toISOString(),
    source: {
      file: 'README-origin.md',
      hash: sourceHash
    },
    total: deals.length,
    deals
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(dataset, null, 2) + '\n', 'utf8');
  await writeFile(README_HASH_PATH, `${sourceHash}\n`, 'utf8');

  console.log(`Extracted ${deals.length} deals into ${path.relative(ROOT, OUTPUT_PATH)}`);
}

function parseTable(table: Table, categoryPath: string[]): Deal[] {
  if (!table.children.length) return [];
  const [headerRow, ...dataRows] = table.children;
  if (!headerRow || headerRow.type !== 'tableRow') return [];

  const headers = headerRow.children.map((cell, index) => ({
    key: normalizeHeader(toString(cell)),
    index
  }));

  const deals: Deal[] = [];

  for (const row of dataRows) {
    if (row.type !== 'tableRow') continue;
    const record = Object.create(null) as Record<string, { text: string; cell: TableCell }>;

    headers.forEach(({ key }, idx) => {
      const cell = (row.children[idx] as TableCell) ?? null;
      if (!cell) return;
      record[key || `col_${idx}`] = {
        text: cleanText(toString(cell)),
        cell
      };
    });

    const deal = buildDeal(record, categoryPath);
    if (deal) deals.push(deal);
  }

  return deals;
}

function buildDeal(
  record: Record<string, { text: string; cell: TableCell }>,
  categoryPath: string[]
): Deal | null {
  const nameCell = record['name'] ?? record['product name'];
  if (!nameCell) return null;
  const name = nameCell.text.trim();
  if (!name) return null;

  const slugSource = `${categoryPath.slice(-2).join(' ')} ${name}`.trim();
  const id = slugify(slugSource, { decamelize: false });

  const badgeCell =
    record[''] || record['icon'] || record['badge'] || record['emoji'] || record['status'];
  const descriptionCell = record['description'];
  const discountCell = record['discount'] || record['deal'];
  const termsCell =
    record['discount code terms'] ||
    record['discount code'] ||
    record['terms'] ||
    record['details'] ||
    discountCell;

  const url = extractFirstLink(nameCell.cell) ?? extractFirstLink(descriptionCell?.cell);
  const termsText = termsCell?.text ?? '';

  const deal: Deal = {
    id,
    categoryPath: [...categoryPath],
    badge: badgeCell?.text || undefined,
    name,
    url,
    description: descriptionCell?.text || undefined,
    discount: discountCell?.text || extractDiscount(termsText),
    code: extractCode(termsText),
    terms: termsText || undefined,
    validUntil: extractDate(termsText),
    tags: buildTags(categoryPath)
  };

  return deal;
}

function extractFirstLink(cell?: TableCell | null): string | undefined {
  if (!cell) return undefined;
  let href: string | undefined;

  visit(cell, (node) => {
    if (!href && node.type === 'link') {
      href = (node as Link).url;
      return EXIT;
    }
    if (!href && node.type === 'html') {
      const match = /href\s*=\s*"([^"]+)"/i.exec((node as any).value ?? '');
      if (match) {
        href = match[1];
        return EXIT;
      }
    }
    return undefined;
  });

  return href;
}

function extractDiscount(text: string): string | undefined {
  const match = text.match(/\b\d{1,3}%[^.,\n]*/);
  return match?.[0];
}

function extractCode(text: string): string | undefined {
  const markdownCode = text.match(/\*\*([A-Z0-9_-]{4,})\*\*/);
  if (markdownCode) return markdownCode[1];
  const inlineCode = text.match(/`([A-Z0-9_-]{4,})`/i);
  if (inlineCode) return inlineCode[1];
  const plain = text.match(/code\s+([A-Z0-9_-]{4,})/i);
  return plain?.[1];
}

function extractDate(text: string): string | undefined {
  const isoMatch = text.match(/20\d{2}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  return undefined;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function updateHeadingMap(map: HeadingMap, depth: number, text: string) {
  map.set(depth, text);
  for (const key of [...map.keys()]) {
    if (key > depth) map.delete(key);
  }
}

function buildCategoryPath(map: HeadingMap): string[] {
  return [...map.entries()]
    .filter(([depth]) => depth >= MIN_HEADING_DEPTH && depth <= MAX_HEADING_DEPTH)
    .sort((a, b) => a[0] - b[0])
    .map(([, text]) => text.trim());
}

function buildTags(categoryPath: string[]): string[] {
  return categoryPath
    .map((segment) => segment.replace(/^[^a-zA-Z0-9]+/, '').toLowerCase())
    .filter(Boolean);
}

function isHeading(node: unknown): node is Heading {
  return Boolean(node && typeof node === 'object' && (node as Heading).type === 'heading');
}

function toHeadingText(node: Heading): string {
  return cleanText(toString(node));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
