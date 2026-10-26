import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, getDict, isLocale } from "@/lib/i18n";
import { SITE_URL, pageMeta } from "@/lib/seo";
import StoreProvider from "@/redux/StoreProvider";
import Toaster from "@/components/Toaster";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    ...pageMeta(lang, "", `Cyberspace — ${t.home.heroTitle}`, t.home.heroText),
    title: { default: `Cyberspace — ${t.home.heroTitle}`, template: "%s | Cyberspace" },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <StoreProvider>{children}<Toaster /></StoreProvider>;
}
