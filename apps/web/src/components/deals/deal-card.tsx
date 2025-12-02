"use client";

import { ExternalLink, Percent } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface DealCardProps {
  deal: {
    id: string;
    name: string;
    description?: string;
    discount?: string;
    code?: string;
    terms?: string;
    validUntil?: string;
    url?: string;
    badge?: string;
    categoryPath: string[];
    categoryLabels: string[];
  };
}

export function DealCard({ deal }: DealCardProps) {
  const t = useTranslations("deal");
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          {deal.badge && <span className="text-xl" aria-hidden>{deal.badge}</span>}
          <CardTitle className="text-base leading-tight">{deal.name}</CardTitle>
        </div>
        {deal.description && <CardDescription className="line-clamp-2 text-sm">{deal.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          {deal.discount && <Badge variant="secondary"><Percent className="mr-1 h-3 w-3" />{deal.discount}</Badge>}
          {deal.code && (
            <Badge variant="outline">
              {t("code")}: <span className="ml-1 font-mono text-xs">{deal.code}</span>
            </Badge>
          )}
        </div>
        {deal.terms && (
          <div className="line-clamp-2 text-muted-foreground">
            <span className="font-medium text-foreground">{t("terms")}:</span> {deal.terms}
          </div>
        )}
        {deal.validUntil && (
          <p className="text-xs text-muted-foreground">{t("expires", { date: deal.validUntil })}</p>
        )}
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{deal.categoryLabels.join(" · ")}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{deal.url?.replace(/^https?:\/\//, "")}</div>
        <Button variant="outline" size="sm" onClick={() => deal.url && window.open(deal.url, "_blank", "noopener,noreferrer")}
          disabled={!deal.url}
        >
          {t("visit")} <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
