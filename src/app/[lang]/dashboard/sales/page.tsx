import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import SalesDashboardClient from "@/components/dashboard/SalesDashboardClient";

export const dynamic = "force-dynamic";

export default async function SalesDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return <SalesDashboardClient lang={lang} t={t} />;
}
