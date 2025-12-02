import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { Locale, locales } from "@/i18n/routing";
import { loadMessages } from "@/lib/messages";

type LayoutComponentProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  const resolvedLocale = locale as Locale;
  const messages = await loadMessages(resolvedLocale);
  return {
    title: messages.site.title,
    description: messages.site.tagline
  };
}

export default async function LocaleLayout({ children, params }: LayoutComponentProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  const resolvedLocale = locale as Locale;
  const messages = await loadMessages(resolvedLocale);

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages} timeZone="UTC">
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
