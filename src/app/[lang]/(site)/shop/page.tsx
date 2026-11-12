import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShopClient from "@/components/ShopClient";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { FadeDown, FadeUp } from "@/components/Motion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return pageMeta(lang, "/shop", t.shop.title, t.shop.subtitle);
}

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <>
      <section className="pagehero">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <Link href={`/${lang}`}>{t.nav.home}</Link>
            <span>/</span>
            <span>{t.shop.title}</span>
          </nav>
          <FadeDown>
            <h1>{t.shop.title}</h1>
          </FadeDown>
          <FadeUp delay={0.06}>
            <p>{t.shop.subtitle}</p>
          </FadeUp>
        </div>
      </section>
      <Suspense
        fallback={
          <div className="container section">
            <ProductGridSkeleton />
          </div>
        }
      >
        <ShopClient />
      </Suspense>
    </>
  );
}
