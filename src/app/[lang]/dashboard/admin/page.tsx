import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import AdminDashboardClient from "@/components/dashboard/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const base = `/${lang}/dashboard/admin`;

  return <AdminDashboardClient lang={lang} t={t} base={base} />;
}
