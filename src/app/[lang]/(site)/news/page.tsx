import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { BACKEND_URL } from "@/lib/server-auth";
import { formatDay } from "@/lib/format";
import { FadeUp, FadeDown } from "@/components/Motion";

export const dynamic = "force-dynamic";

interface NewsItem {
  id: number;
  slug: string;
  imageUrl: string | null;
  publishedAt: string | null;
  translations: { lang: string; title: string; excerpt: string | null }[];
}

async function fetchPublishedNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/news/published`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return pageMeta(lang, "/news", t.nav.news, "");
}

export default async function NewsListPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const L = lang.toUpperCase();
  const items = await fetchPublishedNews();

  const readMoreLabel = { en: "Read more →", az: "Daha çox oxu →", ru: "Читать далее →" }[lang as "en" | "az" | "ru"] ?? "Read more →";

  return (
    <>
      <section className="page-hero container">
        <FadeDown>
          <h1>{t.nav.news}</h1>
        </FadeDown>
      </section>

      <section className="container section">
        {items.length === 0 ? (
          <p className="muted">{t.dash.noData}</p>
        ) : (
          <div className="news-full-grid">
            {items.map((n, i) => {
              const trans = n.translations.find((tr) => tr.lang === L) ?? n.translations[0];
              return (
                <FadeUp key={n.id} delay={(i % 3) * 0.07}>
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
                        {n.publishedAt && (
                          <time dateTime={n.publishedAt} className="news-full-card__date">
                            {formatDay(n.publishedAt, lang)}
                          </time>
                        )}
                      </div>
                      <h3 className="news-full-card__title">{trans?.title ?? n.slug}</h3>
                      {trans?.excerpt && <p className="news-full-card__excerpt">{trans.excerpt}</p>}
                      <span className="sol-card__link">{readMoreLabel}</span>
                    </div>
                  </Link>
                </FadeUp>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
