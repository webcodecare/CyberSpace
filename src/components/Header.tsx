"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";
import Logo from "./Logo";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";

const NAV = [
  ["home", ""], ["about", "/about"], ["products", "/shop"], ["solutions", "/solutions"],
  ["partners", "/partners"], ["news", "/news"], ["careers", "/careers"], ["contact", "/contact"],
] as const;

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function Header() {
  const { lang, t } = useLang();
  const user = useAuthUser();
  const pathname = usePathname() || `/${lang}`;
  const [open, setOpen] = useState(false);
  const base = `/${lang}`;
  const authHref = user ? `${base}/dashboard` : `${base}/login`;
  const authLabel = user ? t.nav.dashboard : t.nav.login;
  const rest = pathname.replace(/^\/[^/]+/, "") || "";
  const isActive = (href: string) => (href === "" ? rest === "" : rest.startsWith(href));
  const swap = (l: Locale) => `/${l}${rest}`;
  const close = () => setOpen(false);
 

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="header">
      <a className="skip" href="#main">{t.common.skipToContent}</a>
      <div className="container header__bar">
        <Link href={base} className="header__logo" onClick={close}><Logo /></Link>

        {/* Desktop nav — hidden below 1040 px */}
        <nav className="nav" aria-label="Main navigation">
          {NAV.map(([key, href]) => (
            <Link key={key} href={`${base}${href}`}
              className={`nav__link${isActive(href) ? " is-active" : ""}`}
              aria-current={isActive(href) ? "page" : undefined}>
              {t.nav[key]}
            </Link>
          ))}
          <Link href={authHref}
            className={`nav__link nav__login${isActive("/login") || isActive("/dashboard") ? " is-active" : ""}`}>
            {authLabel}
          </Link>
        </nav>

        <div className="header__tools">
          {/* Search — hidden on small mobile via CSS */}
          <Link href={`${base}/shop`} className="iconbtn header__search" aria-label={t.common.search}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>

          {/* Language switcher — desktop header */}
          <div className="lang header__lang" role="group" aria-label={t.common.language}>
            {LOCALES.map((l) => (
              <Link key={l} href={swap(l)} hrefLang={l}
                className={`lang__btn${l === lang ? " is-active" : ""}`}
                aria-current={l === lang ? "true" : undefined}>
                {LOCALE_LABEL[l]}
              </Link>
            ))}
          </div>

          {/* Hamburger — hidden ≥ 1040 px */}
          <button type="button" className="iconbtn menubtn"
            aria-expanded={open} aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}>
            <span className="menubtn-icon" aria-hidden="true">
              <span className="menubtn-bar"/>
              <span className="menubtn-bar"/>
              <span className="menubtn-bar"/>
            </span>
          </button>
        </div>
      </div>

      {/* Dark overlay — closes menu on click */}
      <AnimatePresence>
        {open && (
          <motion.div key="nav-overlay" className="nav-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            onClick={close} aria-hidden="true"/>
        )}
      </AnimatePresence>

      {/* Mobile nav panel */}
      <AnimatePresence>
        {open && (
          <motion.nav key="mobile-nav" id="mobile-nav" className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: EASE }}>

            {/* Language row inside mobile menu */}
            <motion.div className="mobile-nav__lang-row"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.2 }}>
              <span className="mobile-nav__lang-label">{t.common.language}</span>
              <div className="lang" role="group" aria-label={t.common.language}>
                {LOCALES.map((l) => (
                  <Link key={l} href={swap(l)} hrefLang={l}
                    className={`lang__btn${l === lang ? " is-active" : ""}`}
                    aria-current={l === lang ? "true" : undefined}
                    onClick={close}>
                    {LOCALE_LABEL[l]}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Nav links with stagger */}
            {NAV.map(([key, href], i) => (
              <motion.div key={key}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.07 + i * 0.034, duration: 0.22, ease: EASE }}>
                <Link href={`${base}${href}`}
                  className={`mobile-nav__link${isActive(href) ? " is-active" : ""}`}
                  aria-current={isActive(href) ? "page" : undefined}
                  onClick={close}>
                  {t.nav[key]}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.07 + NAV.length * 0.034, duration: 0.22, ease: EASE }}>
              <Link href={authHref}
                className={`mobile-nav__link${isActive("/login") || isActive("/dashboard") ? " is-active" : ""}`}
                onClick={close}>
                {authLabel}
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
