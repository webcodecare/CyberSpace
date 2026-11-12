import { notFound } from "next/navigation";
import { isLocale, getDict } from "@/lib/i18n";
import NewsClient from "./NewsClient";

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return <NewsClient lang={lang} t={t} />;
}
