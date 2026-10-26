"use client";

import Link from "next/link";
import { useGetUserInquiriesQuery } from "@/redux/fetchers/inquiry/inquiryApi";
import { useMeQuery } from "@/redux/fetchers/auth/authApi";
import { formatDate } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";

function getProductName(inq: { product?: { translations?: { lang: string; name: string }[] } }, lang: string) {
  const trans = inq.product?.translations?.find((x) => x.lang === lang.toUpperCase());
  return trans?.name ?? "—";
}

export default function SalesDashboardClient({ lang, t }: { lang: string; t: Dict }) {
  const { data: inquiries = [], isLoading } = useGetUserInquiriesQuery();
  const { data: user } = useMeQuery();
  const recent = inquiries.slice(0, 5);
  const base = `/${lang}/dashboard/sales`;

  function statusLabel(s: string) {
    if (s === "NEW") return t.dash.statusNew;
    if (s === "IN_PROGRESS") return t.dash.statusInProgress;
    return t.dash.statusDone;
  }

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">
            {t.dash.welcomeBack}{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="dash-page-sub">{t.dash.userPanel}</p>
        </div>
      </div>

      <div className="sales-quick-actions">
        <Link href={`${base}/inquiries`} className="quick-action-card">
          <div className="quick-action-card__icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span className="quick-action-card__label">{t.dash.myInquiries}</span>
        </Link>
      </div>

      <div className="dash-section">
        <div className="dash-section__head">
          <h2 className="dash-section__title">{t.dash.recentInquiries}</h2>
          <Link href={`${base}/inquiries`} className="dash-section__link">
            {t.common.viewAll} →
          </Link>
        </div>
        {isLoading ? (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>{t.dash.product}</th><th>{t.dash.date}</th><th>{t.dash.status}</th></tr></thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td><span className="skel skel--md" /></td>
                    <td><span className="skel skel--sm" /></td>
                    <td><span className="skel skel--badge" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : recent.length === 0 ? (
          <div className="dash-empty">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>{t.dash.noInquiries}</p>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t.dash.product}</th>
                  <th>{t.dash.date}</th>
                  <th>{t.dash.status}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inq) => (
                  <tr key={inq.id}>
                    <td>{getProductName(inq, lang)}</td>
                    <td>{formatDate(inq.createdAt, lang as Locale)}</td>
                    <td>
                      <span className={`status-badge status-badge--${inq.status.toLowerCase().replace("_", "-")}`}>
                        {statusLabel(inq.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
