"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { useTranslations } from "next-intl";

import type { Deal } from "@awesome-bfcm/deals-schema";
import type { LocalizedFields } from "@/lib/deals";
import { DealCard } from "./deal-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LocalizedDeal = Deal & LocalizedFields;

interface CategoryFilter {
  name: string;
  slug: string;
  path: string[];
  count: number;
}

interface DealsExplorerProps {
  deals: LocalizedDeal[];
  featured: LocalizedDeal[];
  categories: CategoryFilter[];
}

export function DealsExplorer({ deals, featured, categories }: DealsExplorerProps) {
  const tHome = useTranslations("home");
  const tActions = useTranslations("actions");
  const [tab, setTab] = useState<"all" | "featured">("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const categoryOptions = useMemo(() => categories.map((cat) => ({ ...cat })), [categories]);
  const categoryLookup = useMemo(() => new Map(categoryOptions.map((cat) => [cat.slug, cat])), [categoryOptions]);

  const fuse = useMemo(
    () =>
      new Fuse(deals, {
        keys: ["name", "description", "categoryPath", "tags"],
        threshold: 0.35,
        ignoreLocation: true
      }),
    [deals]
  );

  const filteredDeals = useMemo(() => {
    const source = tab === "featured" ? featured : deals;
    let list = source;

    if (category !== "all") {
      const target = categoryLookup.get(category);
      if (target) {
        list = list.filter((deal) => target.path.every((segment, index) => deal.categoryPath[index] === segment));
      }
    }

    if (query.trim().length > 0) {
      const allowedIds = new Set(list.map((deal) => deal.id));
      const hits = fuse.search(query.trim()).map((result) => result.item);
      list = hits.filter((deal) => allowedIds.has(deal.id));
    }

    return list;
  }, [tab, category, query, fuse, deals, featured, categoryLookup]);

  const resetFilters = () => {
    setCategory("all");
    setQuery("");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border bg-background/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Tabs value={tab} onValueChange={(value) => setTab(value as "all" | "featured")}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="all">{tHome("tabAll")}</TabsTrigger>
                <TabsTrigger value="featured">{tHome("tabFeatured")}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tHome("filterPlaceholder")}
                className="sm:w-64"
              />
              {(query || category !== "all") && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  {tActions("clear")}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{tHome("filtersTitle")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={category === "all" ? "default" : "outline"}
                onClick={() => setCategory("all")}
              >
                {tHome("filterAll")}
              </Button>
              {categoryOptions.map((cat) => (
                <Button
                  key={cat.slug}
                  size="sm"
                  variant={category === cat.slug ? "default" : "outline"}
                  onClick={() => setCategory(cat.slug)}
                >
                  {cat.name}
                  <span className="ml-1 text-xs text-muted-foreground">({cat.count})</span>
                </Button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{tHome("resultsCount", { count: filteredDeals.length })}</p>
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {tHome("empty")}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </section>
  );
}
