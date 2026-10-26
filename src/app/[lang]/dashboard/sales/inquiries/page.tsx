import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import SalesInquiriesClient from "@/components/dashboard/SalesInquiriesClient";

export const dynamic = "force-dynamic";

export default async function SalesInquiriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return <SalesInquiriesClient lang={lang} t={t} />;
}
