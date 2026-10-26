"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/data/catalog";
import { useLang } from "@/lib/useLang";
import { useGetProductsQuery } from "@/redux/fetchers/product/productApi";
import { useGetSettingsQuery } from "@/redux/fetchers/settings/settingsApi";
import { useGetCategoriesQuery } from "@/redux/fetchers/category/categoryApi";
import { useAppDispatch } from "@/redux/store";
import { openInquiry } from "@/redux/inquirySlice";
import ProductCard from "./ProductCard";
import { FadeUp } from "./Motion";

type SortKey = "relevance" | "nameAsc" | "priceAsc" | "priceDesc";

export default function ShopClient() {
  const { lang, t } = useLang();
  const dispatch = useAppDispatch();
  const params = useSearchParams();

  const { data: rawProducts = [], isLoading, isError, refetch } = useGetProductsQuery();
  const { data: settings = { showPrices: true, showStock: true } } = useGetSettingsQuery();
  const { data: dbCats = [] } = useGetCategoriesQuery();

  const categories = useMemo(() =>
    dbCats.length > 0
      ? dbCats.map((c) => ({ id: c.slug, name: { en: c.nameEN, az: c.nameAZ, ru: c.nameRU } }))
      : CATEGORIES,
    [dbCats]
  );

  const [category, setCategory] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    if (rawProducts.length === 0) return;
    const c = params.get("category");
    if (c && categories.some((x) => x.id === c)) setCategory(c);
    const q = params.get("q");
    if (q) setQuery(q);
  }, [params, rawProducts.length, categories]);

  const products = useMemo(() =>
    rawProducts.map((p) => ({
      ...p,
      price: settings.showPrices ? p.price : null,
      currency: settings.showPrices ? p.currency : null,
      stock: settings.showStock ? p.stock : null,
    })),
    [rawProducts, settings]
  );

  const filtered = useMemo(() => {
    let result = products;
    if (category) result = result.filter((p) => p.category === category);
    if (brands.length) result = result.filter((p) => brands.includes(p.brand));
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        Object.values(p.names ?? {}).some((n) => n.toLowerCase().includes(q))
      );
    }
    if (priceMin !== null) result = result.filter((p) => p.price !== null && p.price >= priceMin);
    if (priceMax !== null) result = result.filter((p) => p.price !== null && p.price <= priceMax);

    switch (sort) {
      case "nameAsc": return [...result].sort((a, b) => a.name.localeCompare(b.name));
      case "priceAsc": return [...result].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      case "priceDesc": return [...result].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
      default: return result;
    }
  }, [products, category, brands, query, priceMin, priceMax, sort]);

  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, [products]);

  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => { if (p.brand) m.set(p.brand, (m.get(p.brand) ?? 0) + 1); });
    return m;
  }, [products]);

  const allBrandNames = useMemo(() => [...brandCounts.keys()].sort((a, b) => a.localeCompare(b)), [brandCounts]);
  const shownBrands = showAllBrands ? allBrandNames : allBrandNames.slice(0, 6);
  const hasPrices = products.some((p) => p.price !== null);
  const num = (v: string) => (v === "" ? null : Math.max(0, Number(v)));

  function resetFilters() {
    setCategory(null); setBrands([]); setQuery(""); setPriceMin(null); setPriceMax(null); setSort("relevance");
  }
  function toggleBrand(b: string) {
    setBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  }

  if (isError) {
    return (
      <div className="container section">
        <div className="empty">
          <p className="muted">{t.common.error}</p>
          <button type="button" className="btn btn--primary" onClick={() => refetch()}>
            {t.common.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop">
      <form className="searchbar container" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="sr" htmlFor="shop-q">{t.common.search}</label>
        <input
          id="shop-q"
          type="search"
          value={query}
          placeholder={t.shop.searchPlaceholder}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn--primary">{t.common.search}</button>
      </form>

      <div className="container shop__layout">
        <button
          type="button"
          className="btn btn--ghost filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filters"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          {t.shop.categories} / {t.shop.brands}
        </button>

        <aside id="filters" className={`filters${filtersOpen ? " is-open" : ""}`}>
          <section className="fgroup">
            <h2 className="fgroup__h">{t.shop.categories}</h2>
            <ul className="flist">
              <li>
                <button
                  type="button"
                  className={`flink${category === null ? " is-active" : ""}`}
                  onClick={() => setCategory(null)}
                >
                  <span>{t.common.all}</span><span className="count">{products.length}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`flink${category === c.id ? " is-active" : ""}`}
                    onClick={() => setCategory(c.id)}
                  >
                    <span>{c.name[lang]}</span><span className="count">{catCounts.get(c.id) ?? 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {allBrandNames.length > 0 && (
            <section className="fgroup">
              <h2 className="fgroup__h">{t.shop.brands}</h2>
              <ul className="flist">
                {shownBrands.map((b) => (
                  <li key={b}>
                    <label className="check">
                      <input type="checkbox" checked={brands.includes(b)} onChange={() => toggleBrand(b)} />
                      <span>{b}</span><span className="count">{brandCounts.get(b)}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {allBrandNames.length > 6 && (
                <button type="button" className="linkbtn" onClick={() => setShowAllBrands((v) => !v)}>
                  {showAllBrands ? t.shop.showLess : t.shop.showMore}
                </button>
              )}
            </section>
          )}

          {hasPrices && (
            <section className="fgroup">
              <h2 className="fgroup__h">{t.shop.priceRange} (USD)</h2>
              <div className="range">
                <div>
                  <label htmlFor="pmin">{t.shop.min}</label>
                  <input id="pmin" type="number" min={0} inputMode="numeric" value={priceMin ?? ""} onChange={(e) => setPriceMin(num(e.target.value))} />
                </div>
                <div>
                  <label htmlFor="pmax">{t.shop.max}</label>
                  <input id="pmax" type="number" min={0} inputMode="numeric" value={priceMax ?? ""} onChange={(e) => setPriceMax(num(e.target.value))} />
                </div>
              </div>
            </section>
          )}

          <button type="button" className="btn btn--ghost btn--block" onClick={resetFilters}>{t.shop.reset}</button>
        </aside>

        <section className="results" aria-live="polite">
          <div className="toolbar">
            <p className="toolbar__count">
              {t.shop.showing} {filtered.length} {t.shop.of} {products.length} {t.shop.products}
            </p>
            <div className="toolbar__ctrl">
              <label htmlFor="sort">{t.shop.sortBy}</label>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="relevance">{t.shop.sortRelevance}</option>
                <option value="nameAsc">{t.shop.sortNameAsc}</option>
                {hasPrices && <option value="priceAsc">{t.shop.sortPriceAsc}</option>}
                {hasPrices && <option value="priceDesc">{t.shop.sortPriceDesc}</option>}
              </select>
              <div className="seg" role="group">
                <button
                  type="button"
                  className={view === "grid" ? "is-active" : ""}
                  aria-pressed={view === "grid"}
                  aria-label={t.shop.gridView}
                  onClick={() => setView("grid")}
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h5v5h-5z" fill="currentColor" /></svg>
                </button>
                <button
                  type="button"
                  className={view === "list" ? "is-active" : ""}
                  aria-pressed={view === "list"}
                  aria-label={t.shop.listView}
                  onClick={() => setView("list")}
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M3 4h14v3H3zM3 9h14v3H3zM3 14h14v3H3z" fill="currentColor" /></svg>
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <p className="muted">{t.common.loading}</p>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <svg viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="20" stroke="var(--border)" strokeWidth="2"/>
                <path d="M16 24h16M24 16v16" stroke="var(--border)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="muted">{t.shop.noResults}</p>
              <button type="button" className="btn btn--primary" onClick={resetFilters}>{t.shop.reset}</button>
            </div>
          ) : (
            <div className={`pgrid${view === "list" ? " pgrid--list" : ""}`}>
              {filtered.map((p, i) => (
                <FadeUp key={p.id} delay={Math.min((i % 4) * 0.055, 0.165)}>
                  <ProductCard product={p} view={view} />
                </FadeUp>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
