import { notFound } from "next/navigation";
import { isLocale, getDict } from "@/lib/i18n";
import CareersClient from "./CareersClient";

export default async function CareersAdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return <CareersClient t={t} />;
}
