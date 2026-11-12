import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import { isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

interface ApiProduct {
  id: string;
  sku: string;
  brand?: string | null;
  translations: { lang: string; name: string; description?: string | null }[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await serverGet<ApiProduct | null>(`/products/${encodeURIComponent(slug)}`, null, [
    CACHE_TAGS.products,
  ]);
  if (!p) return {};
  const trans = p.translations?.find((t) => t.lang === lang.toUpperCase()) ?? p.translations?.[0];
  const name = trans?.name ?? p.sku;
  const desc = trans?.description ?? "";
  return pageMeta(lang, `/shop/${slug}`, `${name}${p.brand ? ` (${p.brand})` : ""}`, desc);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  return <ProductDetail slug={slug} />;
}
