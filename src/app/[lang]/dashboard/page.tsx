import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const session = await getServerSession();
  if (!session) redirect(`/${lang}/login`);
  if (session.role === "ADMIN") redirect(`/${lang}/dashboard/admin`);
  redirect(`/${lang}/dashboard/sales`);
}
