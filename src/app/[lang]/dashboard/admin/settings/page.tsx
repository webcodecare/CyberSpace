import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.settings}</h1>
          <p className="dash-page-sub">Control what information is visible on the public site.</p>
        </div>
      </div>
      <SettingsClient t={t} />
    </div>
  );
}
