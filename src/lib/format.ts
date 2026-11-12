import type { Locale } from "./i18n";

const INTL: Record<Locale, string> = { az: "az-AZ", en: "en-US", ru: "ru-RU" };

export function formatPrice(value: number, currency: string, lang: Locale) {
  return new Intl.NumberFormat(INTL[lang], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string, lang: Locale) {
  return new Intl.DateTimeFormat(INTL[lang], { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

export function formatDay(iso: string, lang: Locale) {
  return new Intl.DateTimeFormat(INTL[lang], { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(iso),
  );
}
