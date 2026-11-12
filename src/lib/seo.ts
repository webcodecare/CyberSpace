import type { Metadata } from "next";
import { LOCALES, type Locale } from "./i18n";

export const SITE_URL = "https://www.cyberspace.az";

/** Title, description, canonical URL and hreflang alternates for one page in one language. */
export function pageMeta(lang: Locale, path: string, title: string, description: string): Metadata {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `/${l}${path}`;
  return {
    title,
    description,
    alternates: { canonical: `/${lang}${path}`, languages },
    openGraph: {
      title,
      description,
      url: `/${lang}${path}`,
      siteName: "Cyberspace",
      locale: lang,
      type: "website",
    },
  };
}
