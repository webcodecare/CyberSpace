import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import ChangePasswordForm from "@/components/dashboard/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminChangePasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.changePassword}</h1>
          <p className="dash-page-sub">Update your admin account password.</p>
        </div>
      </div>
      <ChangePasswordForm t={t} />
    </div>
  );
}
