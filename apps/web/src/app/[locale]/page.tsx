import { unstable_setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/language-switcher";
import { DealsExplorer } from "@/components/deals/deals-explorer";
import { GlobalSearch } from "@/components/search/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import { getCategoryTree, getDatasetMeta, getFeaturedDeals, getLocalizedDeals } from "@/lib/deals";
import { loadMessages } from "@/lib/messages";

type PageComponentProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: PageComponentProps) {
  const { locale } = await params;
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : locales[0];
  unstable_setRequestLocale(resolvedLocale);

  const messages = await loadMessages(resolvedLocale);
  const siteMessages = messages.site;
  const homeMessages = messages.home;

  const deals = getLocalizedDeals(resolvedLocale);
  const featured = getFeaturedDeals(resolvedLocale);
  const categories = getCategoryTree(resolvedLocale);
  const meta = getDatasetMeta();

  const formattedDate = new Intl.DateTimeFormat(resolvedLocale, { dateStyle: "medium" }).format(new Date(meta.generatedAt));
  const numberFormatter = new Intl.NumberFormat(resolvedLocale);

  const searchDeals = deals.map((deal) => ({
    id: deal.id,
    name: deal.name,
    description: deal.description,
    categoryPath: deal.categoryPath,
    categoryLabels: deal.categoryLabels,
    url: deal.url,
    code: deal.code
  }));

  const categoryFilters = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    path: category.path,
    count: category.count
  }));

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-8">
        <header className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">{siteMessages.tagline}</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{siteMessages.title}</h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                {formatMessage(homeMessages.heroSubtitle, { count: numberFormatter.format(meta.total) })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border bg-background/80 p-4 shadow-sm md:flex-row md:items-center">
            <div className="flex-1">
              <GlobalSearch deals={searchDeals} />
            </div>
            <div className="text-sm text-muted-foreground md:text-right">
              {formatMessage(homeMessages.lastUpdated, { date: formattedDate })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard label={homeMessages.statTotal} value={numberFormatter.format(deals.length)} />
            <StatsCard label={homeMessages.statCategories} value={numberFormatter.format(categoryFilters.length)} />
            <StatsCard label={homeMessages.statFeatured} value={numberFormatter.format(featured.length)} />
          </div>
        </header>

        <DealsExplorer deals={deals} featured={featured} categories={categoryFilters} />
      </div>
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background/70 p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatMessage(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
