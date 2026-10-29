import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";
import { isLocale, getDict } from "@/lib/i18n";
import { notFound } from "next/navigation";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
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
  if (session.role !== "ADMIN") redirect(`/${lang}/dashboard/sales`);
  const t = getDict(lang);
  return (
    <div className="dash-shell">
      <AdminSidebar lang={lang} t={t} user={session} />
      <div className="dash-main">
        <DashboardHeader lang={lang} t={t} user={session} />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
