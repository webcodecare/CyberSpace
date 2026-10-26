"use client";

import Link from "next/link";
import type { PublicProduct, CategoryId } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { useLang } from "@/lib/useLang";
import { useAppDispatch } from "@/redux/store";
import { openInquiry } from "@/redux/inquirySlice";
import ProductImage from "./ProductImage";

export function StockBadge({ stock }: { stock: number | null }) {
  const { t } = useLang();
  if (stock === null) return null;
  return stock > 0
    ? <span className="stock stock--in">{t.common.inStock}</span>
    : <span className="stock stock--out">{t.common.outOfStock}</span>;
}

export function PriceText({ product }: { product: PublicProduct }) {
  const { lang } = useLang();
  if (product.price === null || product.currency === null) return null;
  return <span className="price">{formatPrice(product.price, product.currency, lang)}</span>;
}

export default function ProductCard({ product, view = "grid" }: { product: PublicProduct; view?: "grid" | "list" }) {
  const { lang, t } = useLang();
  const dispatch = useAppDispatch();
  const href = `/${lang}/shop/${product.id}`;
  const displayName = product.names?.[lang] ?? product.names?.["en"] ?? product.name;

  return (
    <article className={`pcard${view === "list" ? " pcard--list" : ""}`}>
      <Link href={href} className="pcard__media" tabIndex={-1} aria-hidden="true">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={displayName} className="pimg" />
          : <ProductImage category={product.category as CategoryId} label={displayName} />}
        <span className="pcard__brand">{product.brand}</span>
      </Link>
      <div className="pcard__body">
        <h3 className="pcard__name"><Link href={href}>{displayName}</Link></h3>
        <p className="pcard__sku">{t.common.partNo}: {product.sku}</p>
        <div className="pcard__meta">
          <StockBadge stock={product.stock} />
          <PriceText product={product} />
        </div>
        <button type="button" className="btn btn--primary btn--block" onClick={() => dispatch(openInquiry(product.id))}>
          {t.common.contactMe}
        </button>
      </div>
    </article>
  );
}
