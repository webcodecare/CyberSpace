"use client";

import Link from "next/link";
import { type Dict, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { useGetInquiriesQuery, type Inquiry } from "@/redux/fetchers/inquiry/inquiryApi";
import { useGetProductsQuery } from "@/redux/fetchers/product/productApi";
import { useGetAllUsersQuery } from "@/redux/fetchers/user/userApi";
import { useGetCategoriesQuery } from "@/redux/fetchers/category/categoryApi";
import { useMeQuery } from "@/redux/fetchers/auth/authApi";

interface Props {
  lang: string;
  t: Dict;
  base: string;
}

function getStatusLabel(status: string, t: Dict) {
  if (status === "NEW") return t.dash.statusNew;
  if (status === "IN_PROGRESS") return t.dash.statusInProgress;
  return t.dash.statusDone;
}

function getProductName(inq: Inquiry, lang: string) {
  const trans = inq.product?.translations?.find((x) => x.lang === lang.toUpperCase());
  return trans?.name ?? "—";
}

export default function AdminDashboardClient({ lang, t, base }: Props) {
  const { data: inquiryData, isLoading: inquiriesLoading } = useGetInquiriesQuery();
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: user } = useMeQuery();

  const isLoading = inquiriesLoading || productsLoading || usersLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="dash-loading">
        <p className="muted">Loading...</p>
      </div>
    );
  }

  const inquiries = inquiryData ?? [];
  const products = productsData ?? [];
  const users = usersData ?? [];
  const categories = categoriesData ?? [];
  const newCount = inquiries.filter((i) => i.status === "NEW").length;
  const inProgressCount = inquiries.filter((i) => i.status === "IN_PROGRESS").length;
  const doneCount = inquiries.filter((i) => i.status === "DONE").length;
  const recent = inquiries.slice(0, 5);

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.welcomeBack}{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="dash-page-sub">{t.dash.adminPanel}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className="stat-card__body">
            <p className="stat-card__label">{t.dash.newInquiries}</p>
            <p className="stat-card__value">{newCount}</p>
          </div>
        </div>
        <div className="stat-card stat-card--amber">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="stat-card__body">
            <p className="stat-card__label">{t.dash.inProgress}</p>
            <p className="stat-card__value">{inProgressCount}</p>
          </div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="stat-card__body">
            <p className="stat-card__label">{t.dash.completed}</p>
            <p className="stat-card__value">{doneCount}</p>
          </div>
        </div>
        <div className="stat-card stat-card--violet">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/></svg>
          </div>
          <div className="stat-card__body">
            <p className="stat-card__label">{t.dash.totalProducts}</p>
            <p className="stat-card__value">{products.length}</p>
          </div>
        </div>
        <div className="stat-card stat-card--cyan">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-card__body">
            <p className="stat-card__label">{t.dash.totalUsers}</p>
            <p className="stat-card__value">{users.length}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid var(--indigo)" }}>
          <div className="stat-card__icon" style={{ background: "var(--indigo-soft)", color: "var(--indigo)" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </div>
          <div className="stat-card__body">
            <p className="stat-card__label">{t.dash.categories ?? "Categories"}</p>
            <p className="stat-card__value">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-section">
        <div className="dash-section__head">
          <h2 className="dash-section__title">Quick Actions</h2>
        </div>
        <div className="dash-quick-grid">
          <Link href={`${base}/products`} className="dash-quick-card">
            <div className="dash-quick-card__icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/></svg>
            </div>
            <div>
              <div className="dash-quick-card__label">{t.dash.products}</div>
              <div className="dash-quick-card__sub">{products.length} total</div>
            </div>
          </Link>
          <Link href={`${base}/inquiries`} className="dash-quick-card">
            <div className="dash-quick-card__icon" style={{ background: newCount > 0 ? "rgba(20,87,217,0.12)" : undefined, color: newCount > 0 ? "var(--blue)" : undefined }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div className="dash-quick-card__label">{t.dash.inquiries}</div>
              <div className="dash-quick-card__sub">{newCount} new</div>
            </div>
          </Link>
          <Link href={`${base}/categories`} className="dash-quick-card">
            <div className="dash-quick-card__icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            </div>
            <div>
              <div className="dash-quick-card__label">{t.dash.categories ?? "Categories"}</div>
              <div className="dash-quick-card__sub">{categories.length} total</div>
            </div>
          </Link>
          <Link href={`${base}/users`} className="dash-quick-card">
            <div className="dash-quick-card__icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div>
              <div className="dash-quick-card__label">{t.dash.users}</div>
              <div className="dash-quick-card__sub">{users.length} accounts</div>
            </div>
          </Link>
          <Link href={`${base}/news`} className="dash-quick-card">
            <div className="dash-quick-card__icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
            </div>
            <div>
              <div className="dash-quick-card__label">{t.dash.news ?? "News"}</div>
              <div className="dash-quick-card__sub">Publish articles</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="dash-section">
        <div className="dash-section__head">
          <h2 className="dash-section__title">{t.dash.recentInquiries}</h2>
          <Link href={`${base}/inquiries`} className="dash-section__link">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty__icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p>{t.dash.noData}</p>
            <Link href={`${base}/inquiries`} className="btn btn--ghost btn--sm dash-empty__cta" style={{ textDecoration: "none" }}>Go to Inquiries</Link>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t.dash.product}</th>
                  <th>{t.dash.customer}</th>
                  <th>{t.dash.phone}</th>
                  <th>{t.dash.date}</th>
                  <th>{t.dash.status}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inq) => (
                  <tr key={inq.id}>
                    <td>{getProductName(inq, lang)}</td>
                    <td>{inq.name}</td>
                    <td>{inq.phone}</td>
                    <td>{formatDate(inq.createdAt, lang as Locale)}</td>
                    <td>
                      <span className={`status-badge status-badge--${inq.status.toLowerCase().replace("_", "-")}`}>
                        {getStatusLabel(inq.status, t)}
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
