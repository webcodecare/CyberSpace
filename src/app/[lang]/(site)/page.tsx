import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, type CategoryId } from "@/data/catalog";
import { formatDay } from "@/lib/format";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { BACKEND_URL } from "@/lib/server-auth";
import { FadeDown, FadeLeft, FadeRight, FadeUp, ZoomIn } from "@/components/Motion";
import heroSvg from "@/assets/animated-ai-hero.svg";

type DbCategory = { id: number; slug: string; nameEN: string; nameAZ: string; nameRU: string; imageUrl: string | null; isActive: boolean; order: number };

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  servers: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/>
      <circle cx="19" cy="5.5" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12.5" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="19.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  networking: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  security: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  computers: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  storage: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  software: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  printing: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  consumer: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  _default: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
    </svg>
  ),
};

const WHY_CARDS = [
  {
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: { en: "Authorised Reseller", az: "Səlahiyyətli Distribütor", ru: "Авторизованный реселлер" },
    desc:  { en: "Genuine products with official warranties from Dell, HPE, Cisco, Fortinet and more.", az: "Dell, HPE, Cisco, Fortinet və digərlərindən rəsmi zəmanətli orijinal məhsullar.", ru: "Оригинальные продукты с официальной гарантией Dell, HPE, Cisco, Fortinet и других." },
  },
  {
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: { en: "Fast Local Delivery", az: "Sürətli Yerli Çatdırılma", ru: "Быстрая местная доставка" },
    desc:  { en: "Baku warehouse stocked with thousands of SKUs — same-day or next-day fulfilment.", az: "Bakı anbarında minlərlə SKU mövcuddur — eyni gün və ya növbəti gün çatdırılma.", ru: "На складе в Баку тысячи SKU — доставка в день заказа или на следующий день." },
  },
  {
    color: "green",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: { en: "Certified Engineers", az: "Sertifikatlı Mühəndislər", ru: "Сертифицированные инженеры" },
    desc:  { en: "50+ certified specialists for installation, configuration and long-term support.", az: "Quraşdırma, konfiqurasiya və uzunmüddətli dəstək üçün 50+ sertifikatlı mütəxəssis.", ru: "50+ сертифицированных специалистов для монтажа, настройки и долгосрочной поддержки." },
  },
  {
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: { en: "Custom IT Projects", az: "Fərdi IT Layihələri", ru: "Индивидуальные IT-проекты" },
    desc:  { en: "End-to-end project delivery — from initial design through installation to handover.", az: "İlkin dizayndan quraşdırma və təhvilə qədər tam həcmli layihə çatdırılması.", ru: "Сквозная реализация проектов — от проектирования до монтажа и сдачи заказчику." },
  },
  {
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    title: { en: "24/7 Support Plans", az: "24/7 Dəstək Planları", ru: "Планы поддержки 24/7" },
    desc:  { en: "Flexible SLAs from 9×5 business hours to round-the-clock critical-system coverage.", az: "9×5 iş saatlarından gecə-gündüz kritik sistem əhatəsinə qədər çevik SLA-lar.", ru: "Гибкие SLA от 9×5 рабочего времени до круглосуточной поддержки критических систем." },
  },
];

const TESTIMONIALS = [
  {
    quote: { en: "Cyberspace delivered and installed our entire server room in under two weeks. The team was professional and the documentation was spotless.", az: "Cyberspace bütün server otağımızı iki həftə ərzində çatdırdı və quraşdırdı. Komanda peşəkar idi, sənədlər mükəmməl idi.", ru: "Cyberspace смонтировала весь наш серверный зал менее чем за две недели. Команда профессиональна, документация безупречна." },
    name: "Anar Həsənov",
    role: { en: "IT Director, Kapital Bank", az: "IT Direktoru, Kapital Bank", ru: "IT-директор, Kapital Bank" },
    initials: "AH",
    bg: "#1457d9",
  },
  {
    quote: { en: "Their FortiGate deployment replaced our aging firewall and cut security incidents by 80%. Excellent pre-sales advice and post-sales support.", az: "Onların FortiGate yerləşdirilməsi köhnə firewall-umuzu əvəz etdi və təhlükəsizlik insidentlərini 80% azaltdı. Əla satış öncəsi məsləhət və satış sonrası dəstək.", ru: "Их развёртывание FortiGate заменило наш устаревший межсетевой экран и сократило число инцидентов безопасности на 80%. Отличные пред- и постпродажные консультации." },
    name: "Günay Əliyeva",
    role: { en: "CTO, AzərGold", az: "CTO, AzərGold", ru: "CTO, AzərGold" },
    initials: "GƏ",
    bg: "#059669",
  },
  {
    quote: { en: "We've sourced all our HP and Lenovo workstations through Cyberspace for three years. Pricing is competitive and delivery is always on time.", az: "Biz üç ildir bütün HP və Lenovo iş stansiyalarımızı Cyberspace vasitəsilə əldə edirik. Qiymətlər rəqabətlidir və çatdırılma həmişə vaxtındadır.", ru: "Три года мы закупаем все рабочие станции HP и Lenovo через Cyberspace. Цены конкурентны, доставка всегда вовремя." },
    name: "Rauf Məmmədov",
    role: { en: "Procurement Lead, SOCAR", az: "Satınalma Rəhbəri, SOCAR", ru: "Руководитель закупок, SOCAR" },
    initials: "RM",
    bg: "#7c3aed",
  },
];

const CLIENTS = [
  "Kapital Bank", "SOCAR", "AzərGold", "Bakcell", "Azercell",
  "PASHA Bank", "ABB Bank", "Silkway Airlines", "Ministry of Finance", "ASAN Service",
];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return pageMeta(lang, "", `Cyberspace — ${t.home.heroTitle}`, t.home.heroText);
}

async function fetchActivePartners() {
  try {
    const res = await fetch(`${BACKEND_URL}/partners/active`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as { id: number; name: string; logoUrl: string | null; websiteUrl: string | null; descEN: string | null; descAZ: string | null; descRU: string | null }[];
  } catch {
    return [];
  }
}

async function fetchPublishedNews() {
  try {
    const res = await fetch(`${BACKEND_URL}/news/published`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as { id: number; slug: string; imageUrl: string | null; publishedAt: string | null; translations: { lang: string; title: string; excerpt: string | null }[] }[];
  } catch {
    return [];
  }
}

async function fetchActiveCategories(): Promise<DbCategory[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const all = (json.data ?? []) as DbCategory[];
    return all.filter((c) => c.isActive);
  } catch {
    return [];
  }
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const h = t.home;
  const features = [[h.f1t, h.f1d], [h.f2t, h.f2d], [h.f3t, h.f3d], [h.f4t, h.f4d]];
  const stats = [["15+", h.statYears], ["100+", h.statBrands], ["1000+", h.statCustomers], ["50+", h.statTeam]];
  const L = lang as "en" | "az" | "ru";

  const [partners, newsItems, dbCats] = await Promise.all([fetchActivePartners(), fetchPublishedNews(), fetchActiveCategories()]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <FadeDown><p className="eyebrow">{h.eyebrow}</p></FadeDown>
            <FadeDown delay={0.06}><h1>{h.heroTitle}</h1></FadeDown>
            <FadeUp delay={0.12}><p className="hero__text">{h.heroText}</p></FadeUp>
            <FadeUp delay={0.2} className="hero__cta">
              <Link href={`/${lang}/shop`} className="btn btn--primary btn--lg">{h.exploreProducts}</Link>
              <Link href={`/${lang}/solutions`} className="btn btn--outline btn--lg">{h.ourSolutions}</Link>
            </FadeUp>
          </div>

          <FadeLeft delay={0.1}>
            <div className="hero__art-wrap">
              <Image
                src={heroSvg}
                alt="Animated AI Technology"
                className="hero__art"
                priority
                unoptimized
              />
            </div>
          </FadeLeft>
        </div>
      </section>

      {/* ── Feature Strip ── */}
      <section className="container features">
        {features.map(([a, b], i) => (
          <FadeUp key={a} delay={i * 0.06} className={`feature feature--${i}`}>
            <span className="feature__icon" aria-hidden="true">
              {i === 0 && <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/></svg>}
              {i === 1 && <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><path d="M22 20c0-3.37-2-6.5-4-8a5.88 5.88 0 0 1 1.8 4"/><path d="M2 20c0-3.37 2-6.5 4-8a5.88 5.88 0 0 0-1.8 4"/></svg>}
              {i === 2 && <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
              {i === 3 && <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
            </span>
            <strong>{a}</strong>
            <span>{b}</span>
          </FadeUp>
        ))}
      </section>

      {/* ── Client Logos ── */}
      <FadeUp className="client-strip">
        <p className="client-strip__label">
          {{ en: "Trusted by Azerbaijan's leading organisations", az: "Azərbaycanın aparıcı təşkilatları tərəfindən etibar edilir", ru: "Доверяют ведущие организации Азербайджана" }[L]}
        </p>
        <div className="client-marquee" aria-label="Client list">
          <div className="client-marquee__track">
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <span key={i} className="client-logo">{c}</span>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* ── Categories ── */}
      <section className="cats-section">
        <div className="container">
          <div className="cats-head">
            <FadeRight>
              <p className="eyebrow cats-eyebrow">{{ en: "Explore Our Range", az: "Çeşidimizi Kəşf Edin", ru: "Изучите наш ассортимент" }[L]}</p>
              <h2 className="cats-title">{h.categoriesTitle}</h2>
            </FadeRight>
            <FadeLeft><Link href={`/${lang}/shop`} className="cats-viewall">{t.common.viewAll} →</Link></FadeLeft>
          </div>
          <div className="catgrid">
            {(dbCats.length > 0
              ? dbCats
              : CATEGORIES.map((c) => ({ id: 0, slug: c.id, nameEN: c.name.en, nameAZ: c.name.az, nameRU: c.name.ru, imageUrl: null, isActive: true, order: 0 }))
            ).map((c, i) => (
              <FadeUp key={c.slug} delay={(i % 4) * 0.055}>
                <Link
                  href={`/${lang}/shop?category=${c.slug}`}
                  className={`catcard catcard--${c.slug}`}
                >
                  <div className="catcard__icon">
                    {c.imageUrl
                      ? <img src={c.imageUrl} alt={c.nameEN} width={26} height={26} style={{ objectFit: "contain" }} />
                      : (CATEGORY_ICONS[c.slug] ?? CATEGORY_ICONS._default)
                    }
                  </div>
                  <div className="catcard__body">
                    <span className="catcard__name">{{ en: c.nameEN, az: c.nameAZ, ru: c.nameRU }[L]}</span>
                  </div>
                  <svg className="catcard__arrow" viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="why-section">
        <div className="container">
          <div className="cats-head">
            <FadeRight>
              <p className="eyebrow cats-eyebrow">{{ en: "Why Cyberspace", az: "Niyə Cyberspace", ru: "Почему Cyberspace" }[L]}</p>
              <h2>{{ en: "The smart choice for enterprise IT", az: "Korporativ IT üçün ağıllı seçim", ru: "Лучший выбор для корпоративного IT" }[L]}</h2>
            </FadeRight>
            <FadeLeft>
              <Link href={`/${lang}/about`} className="cats-viewall">
                {{ en: "About us →", az: "Haqqımızda →", ru: "О нас →" }[L]}
              </Link>
            </FadeLeft>
          </div>
          <div className="why-grid">
            {WHY_CARDS.map((w, i) => (
              <FadeUp key={i} delay={(i % 3) * 0.07} className={`why-card why-card--${w.color}`}>
                <span className="why-card__num">{String(i + 1).padStart(2, "0")}</span>
                <div className="why-card__icon">{w.icon}</div>
                <h3 className="why-card__title">{w.title[L]}</h3>
                <p className="why-card__desc">{w.desc[L]}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="band">
        <div className="container band__inner">
          <FadeRight>
            <h2>{h.aboutTitle}</h2>
            <p>{h.aboutText}</p>
            <Link href={`/${lang}/about`} className="btn btn--primary">{h.aboutBtn}</Link>
          </FadeRight>
          <FadeLeft delay={0.08}>
            <dl className="stats">
              {stats.map(([n, l]) => <div key={l}><dt>{n}</dt><dd>{l}</dd></div>)}
            </dl>
          </FadeLeft>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="container">
          <FadeUp className="cats-head">
            <div>
              <p className="eyebrow cats-eyebrow">{{ en: "Client Stories", az: "Müştəri Hekayələri", ru: "Истории клиентов" }[L]}</p>
              <h2>{{ en: "What our clients say", az: "Müştərilərimiz nə deyir", ru: "Что говорят наши клиенты" }[L]}</h2>
            </div>
          </FadeUp>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((tm, i) => (
              <FadeUp key={i} delay={i * 0.08} className="testimonial-card">
                <div className="testimonial-card__stars">★★★★★</div>
                <p className="testimonial-card__quote">{tm.quote[L]}</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar" style={{ background: tm.bg }}>{tm.initials}</div>
                  <div>
                    <p className="testimonial-card__name">{tm.name}</p>
                    <p className="testimonial-card__role">{tm.role[L]}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      {partners.length > 0 && (
        <section className="container section">
          <FadeUp className="section__head">
            <h2>{h.partnersTitle}</h2>
            <Link href={`/${lang}/partners`} className="more">{t.common.viewAll} →</Link>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ul className="partners">
              {partners.map((p, i) => {
                const inner = p.logoUrl
                  ? <img src={p.logoUrl} alt={p.name} loading="lazy" />
                  : <span className="partners__name">{p.name}</span>;
                return (
                  <li key={p.id} className="partners__item" style={{ transitionDelay: `${Math.min(i * 0.04, 0.3)}s` }}>
                    {p.websiteUrl
                      ? <a className="partners__link" href={p.websiteUrl} target="_blank" rel="noreferrer" aria-label={p.name}>{inner}</a>
                      : <div className="partners__link">{inner}</div>}
                  </li>
                );
              })}
            </ul>
          </FadeUp>
        </section>
      )}

      {/* ── News ── */}
      {newsItems.length > 0 && (
        <section className="container section">
          <FadeUp className="section__head">
            <h2>{h.newsTitle}</h2>
            <Link href={`/${lang}/news`} className="more">{t.common.viewAll} →</Link>
          </FadeUp>
          <div className="newsgrid">
            {newsItems.slice(0, 4).map((n, i) => {
              const trans = n.translations.find((tr) => tr.lang === L.toUpperCase()) ?? n.translations[0];
              return (
                <FadeUp key={n.id} delay={i * 0.08}>
                  <Link href={`/${lang}/news/${n.slug}`} className="news-full-card">
                    <div className="news-full-card__img-wrap">
                      {n.imageUrl ? (
                        <Image
                          src={n.imageUrl}
                          alt={trans?.title ?? n.slug}
                          width={400}
                          height={220}
                          className="news-full-card__img"
                          unoptimized
                          loading="lazy"
                        />
                      ) : (
                        <div className="news-full-card__img-placeholder" aria-hidden="true" />
                      )}
                    </div>
                    <div className="news-full-card__body">
                      <div className="news-full-card__top">
                        {n.publishedAt && <time dateTime={n.publishedAt} className="news-full-card__date">{formatDay(n.publishedAt, lang)}</time>}
                      </div>
                      <h3 className="news-full-card__title">{trans?.title ?? n.slug}</h3>
                    </div>
                  </Link>
                </FadeUp>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
