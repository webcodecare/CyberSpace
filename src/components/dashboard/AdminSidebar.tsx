"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, Layers, MessageSquare, Users,
  Handshake, Newspaper, Settings, Lock, Globe, LogOut,
  Menu, X,
} from "lucide-react";
import type { Dict } from "@/lib/i18n";
import type { JwtUser } from "@/lib/server-auth";
import Logo from "@/components/Logo";
import { useLogoutFromDbMutation } from "@/redux/fetchers/auth/authApi";
import { logout } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/store";

interface Props {
  lang: string;
  t: Dict;
  user: JwtUser;
}

export default function AdminSidebar({ lang, t, user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const [logoutFromDb] = useLogoutFromDbMutation();

  const base = `/${lang}/dashboard/admin`;

  const links = [
    { href: base, label: t.dash.overview, icon: <LayoutDashboard size={17} />, exact: true },
    { href: `${base}/products`, label: t.dash.products, icon: <Package size={17} /> },
    { href: `${base}/categories`, label: t.dash.categories ?? "Categories", icon: <Layers size={17} /> },
    { href: `${base}/inquiries`, label: t.dash.inquiries, icon: <MessageSquare size={17} /> },
    { href: `${base}/users`, label: t.dash.users, icon: <Users size={17} /> },
    { href: `${base}/partners`, label: t.dash.partners ?? "Partners", icon: <Handshake size={17} /> },
    { href: `${base}/news`, label: t.dash.news ?? "News", icon: <Newspaper size={17} /> },
    { href: `${base}/settings`, label: t.dash.settings, icon: <Settings size={17} /> },
    { href: `${base}/change-password`, label: t.dash.changePassword, icon: <Lock size={17} /> },
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
    <nav className="sidebar__nav" aria-label="Admin navigation">
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
      {/* Mobile top bar */}
      <div className="dash-topbar">
        <button className="sidebar__hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <Link href={`/${lang}`} className="dash-topbar__logo"><Logo light /></Link>
        <div className="dash-topbar__user">
          <span className="sidebar__role-badge sidebar__role-badge--admin">ADMIN</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="sidebar" aria-label="Admin panel">
        <div className="sidebar__header">
          <Link href={`/${lang}`} className="sidebar__logo"><Logo light /></Link>
        </div>
        <div className="sidebar__user">
          <div className="sidebar__avatar">{(user.name ?? user.email)[0].toUpperCase()}</div>
          <div className="sidebar__userinfo">
            <p className="sidebar__username">{user.name ?? user.email}</p>
            <span className="sidebar__role-badge sidebar__role-badge--admin">ADMIN</span>
          </div>
        </div>
        {nav}
        <div className="sidebar__footer">
          <Link href={`/${lang}`} className="sidebar__link sidebar__link--secondary">
            <span className="sidebar__icon" aria-hidden="true"><Globe size={17} /></span>
            <span>{t.dash.publicSite}</span>
          </Link>
          <button className="sidebar__link sidebar__link--danger" onClick={handleLogout}>
            <span className="sidebar__icon" aria-hidden="true"><LogOut size={17} /></span>
            <span>{t.dash.logout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
      <aside className={`sidebar sidebar--mobile${mobileOpen ? " is-open" : ""}`} aria-label="Admin navigation mobile">
        <div className="sidebar__header">
          <Link href={`/${lang}`} className="sidebar__logo" onClick={() => setMobileOpen(false)}><Logo light /></Link>
          <button className="sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="sidebar__user">
          <div className="sidebar__avatar">{(user.name ?? user.email)[0].toUpperCase()}</div>
          <div className="sidebar__userinfo">
            <p className="sidebar__username">{user.name ?? user.email}</p>
            <span className="sidebar__role-badge sidebar__role-badge--admin">ADMIN</span>
          </div>
        </div>
        {nav}
        <div className="sidebar__footer">
          <Link href={`/${lang}`} className="sidebar__link sidebar__link--secondary" onClick={() => setMobileOpen(false)}>
            <span className="sidebar__icon" aria-hidden="true"><Globe size={17} /></span>
            <span>{t.dash.publicSite}</span>
          </Link>
          <button className="sidebar__link sidebar__link--danger" onClick={handleLogout}>
            <span className="sidebar__icon" aria-hidden="true"><LogOut size={17} /></span>
            <span>{t.dash.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
