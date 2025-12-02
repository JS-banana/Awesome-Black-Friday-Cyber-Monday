import { getRequestConfig } from "next-intl/server";

import { defaultLocale } from "@/i18n/routing";

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: {}
}));
