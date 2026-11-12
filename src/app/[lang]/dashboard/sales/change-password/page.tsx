import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import ChangePasswordForm from "@/components/dashboard/ChangePasswordForm";

export default async function SalesChangePasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <div>
      <div className="dash-page-header">
        <h1 className="dash-page-title">{t.dash.changePassword}</h1>
      </div>
      <ChangePasswordForm t={t} />
    </div>
  );
}
