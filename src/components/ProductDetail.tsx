"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CategoryId } from "@/data/catalog";
import { useLang } from "@/lib/useLang";
import { useAppDispatch } from "@/redux/store";
import { openInquiry } from "@/redux/inquirySlice";
import { useGetProductsQuery } from "@/redux/fetchers/product/productApi";
import { useGetSettingsQuery } from "@/redux/fetchers/settings/settingsApi";
import { useGetCategoriesQuery } from "@/redux/fetchers/category/categoryApi";
import ProductCard, { PriceText, StockBadge } from "./ProductCard";
import ProductImage from "./ProductImage";
import { FadeLeft, FadeRight, FadeUp } from "./Motion";

type Tab = "description" | "specifications" | "related";

export default function ProductDetail({ slug }: { slug: string }) {
  const { lang, t } = useLang();
  const dispatch = useAppDispatch();

  const { data: allProducts = [], isLoading } = useGetProductsQuery();
  const { data: settings = { showPrices: true, showStock: true } } = useGetSettingsQuery();
  const { data: dbCats = [] } = useGetCategoriesQuery();

  const [tab, setTab] = useState<Tab>("description");

  const rawProduct = allProducts.find((p) => p.id === slug) ?? null;

  const product = useMemo(() => {
    if (!rawProduct) return null;
    return {
      ...rawProduct,
      price: settings.showPrices ? rawProduct.price : null,
      currency: settings.showPrices ? rawProduct.currency : null,
      stock: settings.showStock ? rawProduct.stock : null,
    };
  }, [rawProduct, settings]);

  if (!product) {
    return (
      <div className="container section">
        <p className="muted">{isLoading ? t.common.loading : t.product.notFound}</p>
        <Link href={`/${lang}/shop`} className="btn btn--ghost">{t.product.back}</Link>
      </div>
    );
  }

  const cat = dbCats.find((c) => c.slug === product.category);
  const catName = cat ? ({ en: cat.nameEN, az: cat.nameAZ, ru: cat.nameRU }[lang] ?? cat.nameEN) : product.category;
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const tabs: Tab[] = ["description", "specifications", "related"];

  const displayName = product.names?.[lang] ?? product.names?.["en"] ?? product.name;
  const description = product.descriptions?.[lang] ?? product.descriptions?.["en"] ?? "";

  return (
    <div className="container section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={`/${lang}`}>{t.nav.home}</Link><span>/</span>
        <Link href={`/${lang}/shop`}>{t.nav.shop}</Link><span>/</span>
        <Link href={`/${lang}/shop?category=${product.category}`}>{catName}</Link>
      </nav>

      <div className="detail">
        <FadeRight className="detail__media">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={displayName} className="pimg" />
            : <ProductImage category={product.category as CategoryId} label={displayName} />}
        </FadeRight>
        <FadeLeft delay={0.06} className="detail__info">
          <span className="pill">{product.brand}</span>
          <h1 className="detail__title">{displayName}</h1>
          <dl className="detail__ids">
            <div><dt>{t.common.partNo}</dt><dd>{product.sku}</dd></div>
            <div><dt>{t.product.sku}</dt><dd>{product.id}</dd></div>
          </dl>
          <div className="detail__row">
            <StockBadge stock={product.stock} />
            {product.stock !== null && product.stock > 0 && <span className="muted">{product.stock} {t.product.pcs}</span>}
          </div>
          <div className="detail__price">
            {product.price !== null ? <PriceText product={product} /> : null}
          </div>
          <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch(openInquiry(product.id))}>
            {t.common.contactMe}
          </button>
        </FadeLeft>
      </div>

      <FadeUp>
        <div className="tabs" role="tablist">
          {tabs.map((k) => (
            <button key={k} role="tab" type="button" id={`tab-${k}`} aria-selected={tab === k} aria-controls={`panel-${k}`}
              className={tab === k ? "is-active" : ""} onClick={() => setTab(k)}>
              {t.product[k]}
            </button>
          ))}
        </div>
        <div className="tabpanel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "description" && (
            description
              ? <p className="prose">{description}</p>
              : <p className="muted">{t.product.contactUs}</p>
          )}
          {tab === "specifications" && (
            product.specs.length > 0 ? (
              <div className="tablewrap">
                <table className="spec">
                  <tbody>{product.specs.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
                </table>
              </div>
            ) : (
              <p className="muted">{t.product.contactUs}</p>
            )
          )}
          {tab === "related" && (
            related.length
              ? <div className="pgrid">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
              : <p className="muted">—</p>
          )}
        </div>
      </FadeUp>
    </div>
  );
}
