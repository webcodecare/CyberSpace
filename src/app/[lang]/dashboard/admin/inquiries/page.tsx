import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import InquiriesClient from "./InquiriesClient";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return <InquiriesClient lang={lang} t={t} />;
}
