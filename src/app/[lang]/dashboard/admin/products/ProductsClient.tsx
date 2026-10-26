"use client";

import { useState } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type CreateProductInput,
} from "@/redux/fetchers/product/productApi";
import { useGetCategoriesQuery } from "@/redux/fetchers/category/categoryApi";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogForm,
} from "@/components/ui/dialog";
import {
  Package, Tag, CircleDollarSign, ImageIcon, FileText,
  Check, X, AlertCircle, CheckCircle2,
} from "lucide-react";
import type { PublicProduct } from "@/data/catalog";
import type { Dict } from "@/lib/i18n";

type LangKey = "EN" | "AZ" | "RU";
const LANGS: LangKey[] = ["EN", "AZ", "RU"];
const CURRENCIES = ["USD", "AZN", "EUR", "GBP"];

interface TranslationForm { name: string; description: string; }
interface FormState {
  sku: string; brand: string; category: string; imageUrl: string;
  price: string; currency: string; stock: string;
  EN: TranslationForm; AZ: TranslationForm; RU: TranslationForm;
}

const emptyTrans = (): TranslationForm => ({ name: "", description: "" });
const emptyForm = (firstCategory = ""): FormState => ({
  sku: "", brand: "", category: firstCategory, imageUrl: "", price: "", currency: "USD", stock: "",
  EN: emptyTrans(), AZ: emptyTrans(), RU: emptyTrans(),
});

function productToForm(p: PublicProduct): FormState {
  return {
    sku: p.sku, brand: p.brand ?? "", category: p.category, imageUrl: p.imageUrl ?? "",
    price: p.price != null ? String(p.price) : "",
    currency: p.currency ?? "USD",
    stock: p.stock != null ? String(p.stock) : "",
    EN: { name: p.names["en"] ?? "", description: p.descriptions["en"] ?? "" },
    AZ: { name: p.names["az"] ?? "", description: p.descriptions["az"] ?? "" },
    RU: { name: p.names["ru"] ?? "", description: p.descriptions["ru"] ?? "" },
  };
}

function formToPayload(f: FormState): CreateProductInput {
  return {
    sku: f.sku.trim(),
    brand: f.brand.trim() || undefined,
    category: f.category,
    imageUrl: f.imageUrl.trim() || null,
    price: f.price ? parseFloat(f.price) : null,
    currency: f.currency || null,
    stock: f.stock ? parseInt(f.stock) : null,
    translations: LANGS
      .filter((l) => f[l].name.trim())
      .map((l) => ({
        lang: l,
        name: f[l].name.trim(),
        description: f[l].description.trim() || undefined,
      })),
  };
}

/* ── Small layout helpers ────────────────────────────────────── */

function SectionHead({ icon, label, first = false }: { icon: React.ReactNode; label: string; first?: boolean }) {
  return (
    <div className="pf-section-head" style={first ? { marginTop: 0 } : { marginTop: 24 }}>
      <span className="pf-section-icon">{icon}</span>
      <span className="pf-section-label">{label}</span>
      <span className="pf-section-line" />
    </div>
  );
}

function PfField({ id, label, required, children }: {
  id?: string; label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="pf-field">
      <label className="pf-label" htmlFor={id}>
        {label}
        {required && <span className="pf-req" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function ProductsClient({ t }: { t: Dict }) {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [create, { isLoading: creating }] = useCreateProductMutation();
  const [update, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PublicProduct | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [activeLang, setActiveLang] = useState<LangKey>("EN");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null); setForm(emptyForm(categories[0]?.slug ?? "")); setError(""); setSuccess(""); setActiveLang("EN"); setOpen(true);
  }
  function openEdit(p: PublicProduct) {
    setEditing(p); setForm(productToForm(p)); setError(""); setSuccess(""); setActiveLang("EN"); setOpen(true);
  }
  function handleOpenChange(v: boolean) {
    if (!v) { setOpen(false); setEditing(null); }
  }
  function setField(key: keyof Omit<FormState, "EN" | "AZ" | "RU">, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function setTransField(l: LangKey, key: keyof TranslationForm, value: string) {
    setForm((prev) => ({ ...prev, [l]: { ...prev[l], [key]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.sku.trim()) { setError("SKU is required."); return; }
    if (!form.EN.name.trim()) { setError("English name is required."); return; }
    try {
      const payload = formToPayload(form);
      if (editing) {
        await update({ id: editing.id, body: payload }).unwrap();
        setSuccess("Product updated successfully.");
      } else {
        await create(payload).unwrap();
        setSuccess("Product created successfully.");
      }
      setTimeout(() => { setSuccess(""); setOpen(false); setEditing(null); }, 1400);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      setError(msg ?? "Save failed. Please try again.");
    }
  }

  function promptDelete(id: string) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    try {
      await deleteProduct(pendingDeleteId).unwrap();
      setConfirmOpen(false);
      setPendingDeleteId(null);
    } catch {
      setConfirmOpen(false);
    }
  }

  const busy = creating || updating;

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.products}</h1>
          <p className="dash-page-sub">{t.dash.syncStatus} — {t.common.syncedFrom1C}</p>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          {t.dash.add ?? "Add Product"}
        </button>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr>
              <th>Image</th><th>SKU</th><th>Name</th><th>Brand</th><th>Category</th><th>Stock</th><th>Price</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><span className="skel skel--thumb" /></td>
                  <td><span className="skel skel--md" style={{ width: 70 }} /></td>
                  <td><span className="skel skel--md" style={{ width: "80%" }} /></td>
                  <td><span className="skel skel--sm" style={{ width: 60 }} /></td>
                  <td><span className="skel skel--badge" /></td>
                  <td><span className="skel skel--sm" style={{ width: 30 }} /></td>
                  <td><span className="skel skel--sm" style={{ width: 60 }} /></td>
                  <td><span className="skel skel--badge" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : products.length === 0 ? (
        <div className="dash-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={{ opacity: 0.3 }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" x2="12" y1="22.08" y2="12"/>
          </svg>
          <p>{t.dash.noData}</p>
          <button type="button" className="btn btn--ghost btn--sm dash-empty__cta" onClick={openCreate}>
            {t.dash.add ?? "Add Product"}
          </button>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>{t.dash.name}</th>
                <th>{t.common.brand}</th>
                <th>{t.common.category}</th>
                <th>{t.product.stock}</th>
                <th>{t.product.price}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="dash-thumb" />
                      : <div className="dash-thumb-placeholder"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
                    }
                  </td>
                  <td style={{ maxWidth: 160 }}><code className="dash-code" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.sku}>{p.sku}</code></td>
                  <td><span className="dash-name">{p.name}</span></td>
                  <td>{p.brand || "—"}</td>
                  <td>
                    {(() => { const name = categories.find((c) => c.slug === p.category)?.nameEN ?? p.category; return <span className="dash-pill" title={name}>{name}</span>; })()}
                  </td>
                  <td>{p.stock ?? "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{p.price != null ? `${p.price} ${p.currency ?? ""}` : "—"}</td>
                  <td>
                    <div className="dash-actions">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(p)}>{t.dash.edit ?? "Edit"}</Button>
                      <Button type="button" variant="destructive" size="sm" disabled={deleting} onClick={() => promptDelete(p.id)}>{t.dash.delete ?? "Delete"}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this product?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* ── Add / Edit modal ── */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent size="xl" onInteractOutside={(e) => e.preventDefault()}>

          {/* Header */}
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #1457d9 0%, #2f6bff 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(20,87,217,0.35)",
              }}>
                <Package size={18} color="#fff" />
              </div>
              <div>
                <DialogTitle>
                  {editing ? `Edit — ${editing.name || editing.sku}` : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update product details, pricing and content."
                    : "Fill in SKU, pricing, media, and multilingual content."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form */}
          <DialogForm id="product-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>

              {/* Alerts */}
              {error && (
                <div className="pf-alert pf-alert--error" role="alert">
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}
              {success && (
                <div className="pf-alert pf-alert--success" role="status">
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  {success}
                </div>
              )}

              {/* ── Section 1: Basic Information ── */}
              <SectionHead first icon={<Tag size={12} />} label="Basic Information" />
              <div className="pf-grid-3">
                <PfField id="pr-sku" label="SKU" required>
                  <input
                    id="pr-sku"
                    className="pf-input pf-input--mono"
                    value={form.sku}
                    onChange={(e) => setField("sku", e.target.value)}
                    disabled={busy || !!editing}
                    maxLength={100}
                    placeholder="e.g. SRV-DELL-001"
                    autoComplete="off"
                  />
                </PfField>
                <PfField id="pr-brand" label="Brand">
                  <input
                    id="pr-brand"
                    className="pf-input"
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value)}
                    disabled={busy}
                    maxLength={100}
                    placeholder="e.g. Dell, Cisco"
                  />
                </PfField>
                <PfField id="pr-category" label="Category" required>
                  <select
                    id="pr-category"
                    className="pf-select"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                    disabled={busy}
                  >
                    {categories.length === 0 && <option value="">— no categories —</option>}
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.nameEN}</option>
                    ))}
                  </select>
                </PfField>
              </div>

              {/* ── Section 2: Pricing & Inventory ── */}
              <SectionHead icon={<CircleDollarSign size={12} />} label="Pricing & Inventory" />
              <div className="pf-grid-3">
                <PfField id="pr-price" label="Unit Price">
                  <div className="pf-prefix-wrap">
                    <span className="pf-prefix">$</span>
                    <input
                      id="pr-price"
                      className="pf-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                      disabled={busy}
                      placeholder="0.00"
                    />
                  </div>
                </PfField>
                <PfField id="pr-currency" label="Currency">
                  <select
                    id="pr-currency"
                    className="pf-select"
                    value={form.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                    disabled={busy}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </PfField>
                <PfField id="pr-stock" label="Stock Qty">
                  <input
                    id="pr-stock"
                    className="pf-input"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                    disabled={busy}
                    placeholder="0"
                  />
                </PfField>
              </div>

              {/* ── Section 3: Product Media ── */}
              <SectionHead icon={<ImageIcon size={12} />} label="Product Media" />
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setField("imageUrl", url)}
                disabled={busy}
                label=""
                hint="JPG, PNG or WebP · max 5 MB · recommended 800×800"
              />

              {/* ── Section 4: Product Details ── */}
              <SectionHead icon={<FileText size={12} />} label="Product Details" />

              {/* Language tabs */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                <div className="pf-lang-tabs" role="tablist" aria-label="Language">
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      role="tab"
                      aria-selected={activeLang === l}
                      className={`pf-lang-tab${activeLang === l ? " is-active" : ""}`}
                      onClick={() => setActiveLang(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: ".75rem", color: "var(--muted)", margin: 0 }}>
                  English name is required. AZ and RU are optional.
                </p>
              </div>

              {/* Language panels */}
              {LANGS.map((l) => (
                <div key={l} style={{ display: activeLang === l ? "flex" : "none", flexDirection: "column", gap: 16 }}>
                  <PfField
                    id={`pr-name-${l}`}
                    label={`Product Name · ${l}`}
                    required={l === "EN"}
                  >
                    <input
                      id={`pr-name-${l}`}
                      className="pf-input"
                      value={form[l].name}
                      onChange={(e) => setTransField(l, "name", e.target.value)}
                      disabled={busy}
                      placeholder={l === "EN" ? "Full product name in English" : `Name in ${l} (optional)`}
                    />
                  </PfField>
                  <PfField label={`Description · ${l}`}>
                    <Textarea
                      rows={5}
                      value={form[l].description}
                      onChange={(e) => setTransField(l, "description", e.target.value)}
                      disabled={busy}
                      placeholder={l === "EN" ? "Describe this product…" : `Description in ${l} (optional)`}
                    />
                  </PfField>
                </div>
              ))}
            </DialogBody>

            {/* Footer */}
            <DialogFooter>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <X size={14} />
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                className="btn btn--primary"
                disabled={busy}
                style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 150 }}
              >
                {busy ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={14} strokeWidth={2.5} />
                    {editing ? "Save Changes" : "Create Product"}
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
