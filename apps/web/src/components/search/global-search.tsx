"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";

type SearchDeal = {
  id: string;
  name: string;
  description?: string;
  categoryPath: string[];
  categoryLabels: string[];
  url?: string;
  code?: string;
};

export function GlobalSearch({ deals }: { deals: SearchDeal[] }) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("search");

  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const grouped = React.useMemo(() => {
    const map = new Map<string, { label: string; items: SearchDeal[] }>();
    deals.forEach((deal) => {
      const label = deal.categoryLabels[0] ?? deal.categoryPath[0] ?? t("groupOther");
      const key = deal.categoryPath[0] ?? label;
      const bucket = map.get(key) ?? { label, items: [] };
      bucket.items.push(deal);
      map.set(key, bucket);
    });
    return [...map.entries()];
  }, [deals, t]);

  return (
    <>
      <Button variant="outline" className="w-full justify-start gap-2 text-sm md:w-64" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">{t("placeholder")}</span>
        <span className="ml-auto hidden text-xs text-muted-foreground md:inline">{t("shortcut")}</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t("title")}>
        <Command>
          <CommandInput placeholder={t("placeholder")} />
          <CommandList>
            <CommandEmpty>{t("empty")}</CommandEmpty>
            {grouped.map(([groupKey, { label, items }]) => (
              <CommandGroup key={groupKey} heading={label}>
                {items.map((deal) => (
                  <CommandItem
                    key={deal.id}
                    value={`${deal.name} ${deal.categoryLabels.join(" ")} ${deal.categoryPath.join(" ")} ${deal.description ?? ""}`}
                    onSelect={() => {
                      if (deal.url) {
                        window.open(deal.url, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{deal.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {deal.description ?? deal.categoryPath.join(" · ")}
                      </span>
                    </div>
                    {deal.code && <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px]">{deal.code}</span>}
                  </CommandItem>
                ))}
                <CommandSeparator />
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
