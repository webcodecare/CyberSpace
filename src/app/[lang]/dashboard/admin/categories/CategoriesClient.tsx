"use client";

import { useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
  type CreateCategoryInput,
} from "@/redux/fetchers/category/categoryApi";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogForm,
} from "@/components/ui/dialog";
import type { Dict } from "@/lib/i18n";

interface FormState {
  slug: string;
  nameEN: string;
  nameAZ: string;
  nameRU: string;
  imageUrl: string;
  isActive: boolean;
  order: string;
}

const emptyForm = (): FormState => ({
  slug: "", nameEN: "", nameAZ: "", nameRU: "", imageUrl: "", isActive: true, order: "0",
});

function categoryToForm(c: Category): FormState {
  return {
    slug: c.slug, nameEN: c.nameEN, nameAZ: c.nameAZ, nameRU: c.nameRU,
    imageUrl: c.imageUrl ?? "", isActive: c.isActive, order: String(c.order),
  };
}

function formToPayload(f: FormState): CreateCategoryInput {
  return {
    slug: f.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    nameEN: f.nameEN.trim(), nameAZ: f.nameAZ.trim(), nameRU: f.nameRU.trim(),
    imageUrl: f.imageUrl.trim() || null,
    isActive: f.isActive,
    order: f.order ? parseInt(f.order) : 0,
  };
}

export default function CategoriesClient({ t }: { t: Dict }) {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [create, { isLoading: creating }] = useCreateCategoryMutation();
  const [update, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null); setForm(emptyForm()); setError(""); setSuccess(""); setOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c); setForm(categoryToForm(c)); setError(""); setSuccess(""); setOpen(true);
  }
  function handleOpenChange(v: boolean) {
    if (!v) { setOpen(false); setEditing(null); }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    if (!form.nameEN.trim()) { setError("English name is required."); return; }
    try {
      const payload = formToPayload(form);
      if (editing) {
        await update({ id: editing.id, body: payload }).unwrap();
        setSuccess("Updated!");
      } else {
        await create(payload).unwrap();
        setSuccess("Created!");
      }
      setTimeout(() => { setSuccess(""); setOpen(false); setEditing(null); }, 1200);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      setError(msg ?? "Save failed. Please try again.");
    }
  }

  function promptDelete(id: number) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await deleteCategory(pendingDeleteId).unwrap();
      setConfirmOpen(false);
      setPendingDeleteId(null);
    } catch {
      setConfirmOpen(false);
    }
  }

  const busy = creating || updating;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.categories ?? "Categories"}</h1>
          <p className="dash-page-sub">Manage product categories and their multilingual names.</p>
        </div>
        <Button type="button" size="sm" onClick={openCreate} style={{ flexShrink: 0 }}>
          + {t.dash.add ?? "Add Category"}
        </Button>
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr>
              <th>Image</th><th>Slug</th><th>EN</th><th>AZ</th><th>RU</th><th>Order</th><th>Active</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td><span className="skel skel--thumb" /></td>
                  <td><span className="skel skel--md" style={{ width: 80 }} /></td>
                  <td><span className="skel skel--md" style={{ width: "70%" }} /></td>
                  <td><span className="skel skel--sm" style={{ width: "60%" }} /></td>
                  <td><span className="skel skel--sm" style={{ width: "60%" }} /></td>
                  <td><span className="skel skel--sm" style={{ width: 24 }} /></td>
                  <td><span className="skel skel--badge" /></td>
                  <td><span className="skel skel--badge" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : categories.length === 0 ? (
        <div className="dash-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.3 }}><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          <p>{t.dash.noData}</p>
          <Button type="button" size="sm" variant="outline" className="dash-empty__cta" onClick={openCreate}>
            {t.dash.add ?? "Add Category"}
          </Button>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Slug</th>
                <th>EN</th>
                <th>AZ</th>
                <th>RU</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.imageUrl
                      ? <img src={c.imageUrl} alt={c.nameEN} className="dash-thumb" />
                      : <div className="dash-thumb-placeholder"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
                    }
                  </td>
                  <td><code className="dash-code">{c.slug}</code></td>
                  <td>{c.nameEN}</td>
                  <td>{c.nameAZ}</td>
                  <td>{c.nameRU}</td>
                  <td>{c.order}</td>
                  <td>
                    <span className={`status-badge ${c.isActive ? "status-badge--ok" : "status-badge--off"}`}>
                      {c.isActive ? "Active" : "Off"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-actions">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(c)}>{t.dash.edit ?? "Edit"}</Button>
                    <Button type="button" variant="destructive" size="sm" disabled={deleting} onClick={() => promptDelete(c.id)}>{t.dash.delete ?? "Delete"}</Button>
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
        title="Delete this category?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--green"><Layers size={20} strokeWidth={2} color="#fff" /></div>
              <div>
                <DialogTitle>{editing ? (t.dash.edit ?? "Edit") : (t.dash.add ?? "Add")} {t.dash.categories ?? "Category"}</DialogTitle>
                <DialogDescription>Set slug, multilingual names, image and sort order.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogForm id="category-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>
              {error && <p className="pf-alert pf-alert--error" role="alert">{error}</p>}
              {success && <p className="pf-alert pf-alert--success">{success}</p>}

              <div className="pf-field" style={{ marginBottom: 12 }}>
                <label htmlFor="cat-slug" className="pf-label">
                  Slug * <span style={{ fontWeight: 400, fontSize: ".72rem", color: "#8899aa", marginLeft: 4 }}>(auto-lowercased, spaces→hyphens)</span>
                </label>
                <Input id="cat-slug" value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  disabled={busy || !!editing} maxLength={60} placeholder="e.g. servers" className="pf-input" />
              </div>

              <div className="pf-grid-3" style={{ marginBottom: 12 }}>
                <div className="pf-field">
                  <label htmlFor="cat-en" className="pf-label">Name EN *</label>
                  <Input id="cat-en" value={form.nameEN}
                    onChange={(e) => setField("nameEN", e.target.value)}
                    disabled={busy} maxLength={100} className="pf-input" />
                </div>
                <div className="pf-field">
                  <label htmlFor="cat-az" className="pf-label">Name AZ</label>
                  <Input id="cat-az" value={form.nameAZ}
                    onChange={(e) => setField("nameAZ", e.target.value)}
                    disabled={busy} maxLength={100} className="pf-input" />
                </div>
                <div className="pf-field">
                  <label htmlFor="cat-ru" className="pf-label">Name RU</label>
                  <Input id="cat-ru" value={form.nameRU}
                    onChange={(e) => setField("nameRU", e.target.value)}
                    disabled={busy} maxLength={100} className="pf-input" />
                </div>
              </div>

              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setField("imageUrl", url)}
                disabled={busy}
                label="Category Image / Icon"
                hint="PNG or SVG recommended"
              />

              <div className="pf-grid-2" style={{ marginTop: 12 }}>
                <div className="pf-field">
                  <label htmlFor="cat-order" className="pf-label">{t.dash.formOrder ?? "Order"}</label>
                  <Input id="cat-order" type="number" min="0" value={form.order}
                    onChange={(e) => setField("order", e.target.value)}
                    disabled={busy} className="pf-input" />
                </div>
                <div className="pf-field" style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 20 }}>
                  <input id="cat-active" type="checkbox" checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                    disabled={busy} style={{ width: 16, height: 16 }} />
                  <label htmlFor="cat-active" className="pf-label" style={{ marginBottom: 0 }}>{t.dash.formActive ?? "Active"}</label>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" form="category-form" disabled={busy}>
                {busy ? "Saving…" : (editing ? t.dash.save : "Create Category")}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
