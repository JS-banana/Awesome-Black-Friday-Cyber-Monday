import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Deal, DealsDataset, TranslationDataset } from '@awesome-bfcm/deals-schema';

const ROOT = path.resolve(process.cwd());
const DATA_DIR = path.resolve(ROOT, 'data');
const DIST_DIR = path.resolve(ROOT, 'dist');

async function main() {
  const [en, zh] = await Promise.all([
    readJson<DealsDataset>(path.join(DATA_DIR, 'deals.en.json')),
    readJson<TranslationDataset>(path.join(DATA_DIR, 'deals.zh.json')).catch(() => undefined)
  ]);

  await mkdir(DIST_DIR, { recursive: true });

  const lines: string[] = [];
  lines.push('# 黑色星期五/网络星期一优惠（中文预览）');
  lines.push('');
  lines.push(`> 生成时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`);
  lines.push('');

  for (const deal of en.deals) {
    const localized = buildLocalizedDeal(deal, zh);
    lines.push(`### ${localized.name}`);
    lines.push('');
    lines.push(`- 分类：${deal.categoryPath.join(' / ')}`);
    lines.push(`- 描述：${localized.description}`);
    if (localized.discount) {
      lines.push(`- 优惠：${localized.discount}`);
    }
    if (localized.code) {
      lines.push(`- 兑换代码：${localized.code}`);
    }
    if (localized.terms) {
      lines.push(`- 条款：${localized.terms}`);
    }
    if (deal.url) {
      lines.push(`- 链接：${deal.url}`);
    }
    lines.push('');
  }

  const outputPath = path.join(DIST_DIR, 'deals-zh.md');
  await writeFile(outputPath, lines.join('\n'), 'utf8');
  console.log(`Exported ${en.deals.length} deals to ${path.relative(ROOT, outputPath)}`);
}

function buildLocalizedDeal(deal: Deal, zh?: TranslationDataset) {
  const entry = zh?.entries[deal.id];
  return {
    name: (entry?.name?.value as string) ?? deal.name,
    description: (entry?.description?.value as string) ?? deal.description ?? '',
    discount: deal.discount,
    code: deal.code,
    terms: (entry?.terms?.value as string) ?? deal.terms ?? ''
  };
}

async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
