"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Dict } from "@/lib/i18n";
import type { JwtUser } from "@/lib/server-auth";
import Logo from "@/components/Logo";
import { useLogoutFromDbMutation } from "@/redux/fetchers/auth/authApi";
import { logout } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  lang: string;
  t: Dict;
  user: JwtUser;
}

export default function SalesSidebar({ lang, t, user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const [logoutFromDb] = useLogoutFromDbMutation();

  const base = `/${lang}/dashboard/sales`;

  const links = [
    { href: base, label: t.dash.myDashboard, icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>, exact: true },
    { href: `${base}/inquiries`, label: t.dash.myInquiries, icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { href: `${base}/change-password`, label: t.dash.changePassword, icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  ];

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href) && (exact || href !== base || pathname === base);

  async function handleLogout() {
    await logoutFromDb().unwrap().catch(() => {});
    dispatch(logout());
    router.push(`/${lang}/login`);
    router.refresh();
  }

  const nav = (
    <nav className="sidebar__nav" aria-label="User navigation">
      {links.map(({ href, label, icon, exact }) => (
        <Link key={href} href={href}
          className={`sidebar__link${isActive(href, exact) ? " is-active" : ""}`}
          onClick={() => setMobileOpen(false)}>
          <span className="sidebar__icon" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <div className="dash-topbar">
        <button className="sidebar__hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <Link href={`/${lang}`} className="dash-topbar__logo"><Logo light /></Link>
        <div className="dash-topbar__user">
          <span className="sidebar__role-badge sidebar__role-badge--sales">SALES</span>
        </div>
      </div>

      <aside className="sidebar" aria-label="User panel">
        <div className="sidebar__header">
          <Link href={`/${lang}`} className="sidebar__logo"><Logo light /></Link>
        </div>
        <div className="sidebar__user">
          <Avatar className="sidebar__avatar">
            <AvatarFallback>{(user.name ?? user.email)[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="sidebar__userinfo">
            <p className="sidebar__username">{user.name ?? user.email}</p>
            <span className="sidebar__role-badge sidebar__role-badge--sales">SALES</span>
          </div>
        </div>
        {nav}
        <div className="sidebar__footer">
          <Link href={`/${lang}`} className="sidebar__link sidebar__link--secondary">
            <span className="sidebar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            <span>{t.dash.publicSite}</span>
          </Link>
          <button className="sidebar__link sidebar__link--danger" onClick={handleLogout}>
            <span className="sidebar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span>{t.dash.logout}</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
      <aside className={`sidebar sidebar--mobile${mobileOpen ? " is-open" : ""}`} aria-label="User navigation mobile">
        <div className="sidebar__header">
          <Link href={`/${lang}`} className="sidebar__logo" onClick={() => setMobileOpen(false)}><Logo light /></Link>
          <button className="sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {nav}
        <div className="sidebar__footer">
          <button className="sidebar__link sidebar__link--danger" onClick={handleLogout}>
            <span className="sidebar__icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            <span>{t.dash.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
