import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";
import { isLocale, getDict } from "@/lib/i18n";
import { notFound } from "next/navigation";
import SalesSidebar from "@/components/dashboard/SalesSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export const dynamic = "force-dynamic";

export default async function SalesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const session = await getServerSession();
  if (!session) redirect(`/${lang}/login`);
  if (session.role !== "SALES") redirect(`/${lang}/dashboard/admin`);
  const t = getDict(lang);
  return (
    <div className="dash-shell">
      <SalesSidebar lang={lang} t={t} user={session} />
      <div className="dash-main">
        <DashboardHeader lang={lang} t={t} user={session} />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
