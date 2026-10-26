import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLocale } from "@/lib/i18n";
import { BACKEND_URL } from "@/lib/server-auth";
import { formatDay } from "@/lib/format";
import { pageMeta } from "@/lib/seo";
import { FadeUp, FadeDown } from "@/components/Motion";

export const dynamic = "force-dynamic";

interface NewsTranslation {
  lang: string;
  title: string;
  excerpt: string | null;
  body: string | null;
}

interface NewsItem {
  id: number;
  slug: string;
  imageUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  translations: NewsTranslation[];
}

type Params = Promise<{ lang: string; id: string }>;

async function fetchBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/news/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function fetchPublished(): Promise<Pick<NewsItem, "id" | "slug" | "imageUrl" | "publishedAt" | "translations">[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/news/published`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const article = await fetchBySlug(id);
  if (!article) return {};
  const L = lang.toUpperCase();
  const trans = article.translations.find((t) => t.lang === L) ?? article.translations[0];
  if (!trans) return {};
  return {
    ...pageMeta(lang, `/news/${id}`, trans.title, trans.excerpt ?? ""),
    openGraph: {
      title: trans.title,
      description: trans.excerpt ?? "",
      images: article.imageUrl ? [{ url: article.imageUrl, width: 800, height: 450 }] : [],
      type: "article",
    },
  };
}

export default async function NewsDetail({ params }: { params: Params }) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const article = await fetchBySlug(id);
  if (!article) notFound();

  const t = getDict(lang);
  const L = lang.toUpperCase();
  const trans = article.translations.find((tr) => tr.lang === L) ?? article.translations[0];
  if (!trans) notFound();

  const allNews = await fetchPublished();
  const related = allNews.filter((n) => n.slug !== id).slice(0, 3);

  const backLabel = { en: "Back to News", az: "Xəbərlərə qayıt", ru: "К новостям" }[lang as "en" | "az" | "ru"] ?? "Back to News";
  const relatedLabel = { en: "More Articles", az: "Digər Məqalələr", ru: "Другие статьи" }[lang as "en" | "az" | "ru"] ?? "More Articles";
  const readMoreLabel = { en: "Read more →", az: "Daha çox oxu →", ru: "Читать далее →" }[lang as "en" | "az" | "ru"] ?? "Read more →";
  const byLabel = { en: "By", az: "Müəllif:", ru: "Автор:" }[lang as "en" | "az" | "ru"] ?? "By";

  const bodyParagraphs = trans.body ? trans.body.split(/\n\n+/).filter(Boolean) : (trans.excerpt ? [trans.excerpt] : []);

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <div className="container breadcrumb__inner">
          <Link href={`/${lang}`} className="breadcrumb__link">{t.nav.home}</Link>
          <span className="breadcrumb__sep" aria-hidden="true">›</span>
          <Link href={`/${lang}/news`} className="breadcrumb__link">{t.nav.news}</Link>
          <span className="breadcrumb__sep" aria-hidden="true">›</span>
          <span className="breadcrumb__current" aria-current="page">{trans.title}</span>
        </div>
      </nav>

      <article className="news-detail">
        <header className="news-detail__header container">
          <FadeDown>
            <div className="news-detail__meta">
              {article.publishedAt && (
                <time dateTime={article.publishedAt} className="news-detail__date">
                  {formatDay(article.publishedAt, lang)}
                </time>
              )}
              {article.authorName && (
                <span className="news-detail__author">{byLabel} {article.authorName}</span>
              )}
            </div>
            <h1 className="news-detail__title">{trans.title}</h1>
            {trans.excerpt && <p className="news-detail__lead">{trans.excerpt}</p>}
          </FadeDown>
        </header>

        <FadeUp>
          <div className="news-detail__img-wrap container">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={trans.title}
                width={1200}
                height={630}
                className="news-detail__img"
                priority
                unoptimized
              />
            ) : (
              <div className="news-detail__img-placeholder" aria-hidden="true" />
            )}
          </div>
        </FadeUp>

        <div className="news-detail__body container">
          <FadeUp>
            <div className="news-detail__prose">
              {bodyParagraphs.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="news-detail__footer">
              <Link href={`/${lang}/news`} className="btn btn--outline news-detail__back">
                ← {backLabel}
              </Link>
            </div>
          </FadeUp>
        </div>
      </article>

      {related.length > 0 && (
        <section className="news-related">
          <div className="container">
            <FadeUp>
              <h2 className="news-related__heading">{relatedLabel}</h2>
            </FadeUp>
            <div className="news-full-grid">
              {related.map((n, i) => {
                const rTrans = n.translations.find((tr) => tr.lang === L) ?? n.translations[0];
                return (
                  <FadeUp key={n.id} delay={i * 0.08}>
                    <Link href={`/${lang}/news/${n.slug}`} className="news-full-card">
                      <div className="news-full-card__img-wrap">
                        {n.imageUrl ? (
                          <Image
                            src={n.imageUrl}
                            alt={rTrans?.title ?? n.slug}
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
                        <h3 className="news-full-card__title">{rTrans?.title ?? n.slug}</h3>
                        {rTrans?.excerpt && <p className="news-full-card__excerpt">{rTrans.excerpt}</p>}
                        <span className="sol-card__link">{readMoreLabel}</span>
                      </div>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
