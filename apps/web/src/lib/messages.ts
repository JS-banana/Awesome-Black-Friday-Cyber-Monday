import type { Locale } from "@/i18n/routing";

export type AppMessages = typeof import("@/messages/en.json");

export async function loadMessages(locale: Locale): Promise<AppMessages> {
  const messages = await import(`@/messages/${locale}.json`);
  return messages.default;
}
