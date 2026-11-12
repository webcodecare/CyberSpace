import { notFound } from "next/navigation";
import { isLocale, getDict } from "@/lib/i18n";
import PartnersClient from "./PartnersClient";

export default async function PartnersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return <PartnersClient t={t} />;
}
