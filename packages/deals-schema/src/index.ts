export type CategoryPath = string[];

export interface Deal {
  id: string;
  categoryPath: CategoryPath;
  badge?: string;
  name: string;
  url?: string;
  description?: string;
  discount?: string;
  code?: string;
  terms?: string;
  validUntil?: string;
  tags?: string[];
}

export interface DealsDataset {
  generatedAt: string;
  source: {
    file: string;
    hash: string;
  };
  total: number;
  deals: Deal[];
}

export interface FieldTranslation {
  value: string | string[];
  sourceHash: string;
  translatedAt: string;
}

export interface DealTranslationEntry {
  name?: FieldTranslation;
  description?: FieldTranslation;
  terms?: FieldTranslation;
  tags?: FieldTranslation;
}

export interface TranslationDataset {
  locale: string;
  updatedAt: string;
  entries: Record<string, DealTranslationEntry>;
}
