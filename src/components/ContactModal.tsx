"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/useLang";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { closeInquiry } from "@/redux/inquirySlice";
import { useSubmitInquiryMutation } from "@/redux/fetchers/inquiry/inquiryApi";
import { useGetProductsQuery } from "@/redux/fetchers/product/productApi";
import ProductImage from "./ProductImage";
import type { CategoryId } from "@/data/catalog";
import { toast } from "@/lib/toast";

const PHONE_OK = (v: string) => /^\+?[0-9\s()\-]{7,20}$/.test(v) && v.replace(/\D/g, "").length >= 7;

export default function ContactModal() {
  const { t } = useLang();
  const dispatch = useAppDispatch();
  const productId = useAppSelector((s) => s.inquiry.modalProductId);
  const { data: products = [] } = useGetProductsQuery();
  const product = products.find((p) => p.id === productId) ?? null;

  const [submitInquiry, { isLoading, isSuccess, isError, error, reset }] = useSubmitInquiryMutation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [human, setHuman] = useState(false);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; spam?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) return;
    setErrors({});
    setName(""); setPhone(""); setMessage(""); setHuman(false); setTrap("");
    reset();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dispatch(closeInquiry()); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [productId, dispatch, reset]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(closeInquiry());
      toast.success(t.inquiry.success, t.inquiry.note);
    }
  }, [isSuccess, dispatch, t]);

  if (!productId || !product) return null;

  const close = () => dispatch(closeInquiry());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t.inquiry.errName;
    if (!PHONE_OK(phone.trim())) next.phone = t.inquiry.errPhone;
    if (trap || !human) next.spam = t.inquiry.errSpam;
    setErrors(next);
    if (Object.keys(next).length) return;

    await submitInquiry({
      productId: product.id,
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim() || undefined,
    });
  };

  const busy = isLoading;
  const errMsg = isError
    ? ((error as { data?: { message?: string } })?.data?.message ?? t.inquiry.errGeneral)
    : null;

  return (
    <div className="modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal__box" role="dialog" aria-modal="true" aria-labelledby="inq-title">
        <div className="modal__head">
          <h2 id="inq-title">{t.inquiry.title}</h2>
          <button type="button" className="iconbtn" aria-label={t.inquiry.close} onClick={close}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="modal__product">
          <div className="modal__thumb">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="modal__thumb-img" />
              : <ProductImage category={product.category as CategoryId} label="" />
            }
          </div>
          <div className="modal__product-info">
            <strong className="modal__product-name">{product.name}</strong>
            <span className="modal__product-sku">{product.sku}</span>
            {product.price != null && (
              <span className="modal__product-price">{product.price} {product.currency ?? ""}</span>
            )}
          </div>
        </div>

        <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="inq-name">{t.inquiry.name} *</label>
              <input id="inq-name" ref={nameRef} value={name} maxLength={80} autoComplete="name" placeholder={t.inquiry.namePh}
                aria-invalid={!!errors.name} onChange={(e) => setName(e.target.value)} disabled={busy} />
              {errors.name && <p className="err">{errors.name}</p>}
            </div>
            <div className="field">
              <label htmlFor="inq-phone">{t.inquiry.phone} *</label>
              <input id="inq-phone" type="tel" value={phone} maxLength={24} autoComplete="tel" placeholder={t.inquiry.phonePh}
                aria-invalid={!!errors.phone} onChange={(e) => setPhone(e.target.value)} disabled={busy} />
              {errors.phone && <p className="err">{errors.phone}</p>}
            </div>
            <div className="field">
              <label htmlFor="inq-msg">{t.inquiry.message}</label>
              <textarea id="inq-msg" rows={3} maxLength={500} value={message} placeholder={t.inquiry.messagePh}
                onChange={(e) => setMessage(e.target.value)} disabled={busy} />
            </div>
            {/* Honeypot: hidden from people, filled in by simple bots. */}
            <div className="hp" aria-hidden="true">
              <label htmlFor="inq-site">Website</label>
              <input id="inq-site" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </div>
            <label className="check check--box">
              <input type="checkbox" checked={human} onChange={(e) => setHuman(e.target.checked)} disabled={busy} />
              <span>{t.inquiry.notRobot}</span>
            </label>
            {errors.spam && <p className="err">{errors.spam}</p>}
            {errMsg && <p className="err" role="alert">{errMsg}</p>}
            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? t.inquiry.sending : t.inquiry.send}
            </button>
            <p className="muted small center">{t.inquiry.note}</p>
        </form>
      </div>
    </div>
  );
}
