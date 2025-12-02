import { createLocalizedPathnamesNavigation, Pathnames } from "next-intl/navigation";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const pathnames: Pathnames<typeof locales> = {
  "/": "/",
  "/category/[slug]": "/category/[slug]"
};

export const routing = {
  locales,
  defaultLocale,
  pathnames,
  localePrefix: "always" as const
};

export const { Link, redirect, usePathname, useRouter, getPathname } = createLocalizedPathnamesNavigation(routing);
