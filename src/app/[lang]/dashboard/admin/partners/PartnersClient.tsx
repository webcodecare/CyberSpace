"use client";

import { useState } from "react";
import {
  useGetPartnersQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  type Partner,
  type CreatePartnerInput,
} from "@/redux/fetchers/partner/partnerApi";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Handshake } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogForm,
} from "@/components/ui/dialog";
import type { Dict } from "@/lib/i18n";

type LangKey = "EN" | "AZ" | "RU";
const LANGS: LangKey[] = ["EN", "AZ", "RU"];

const emptyForm = (): CreatePartnerInput => ({
  name: "", logoUrl: "", websiteUrl: "",
  descEN: "", descAZ: "", descRU: "",
  isActive: true, order: 0,
});

function partnerToForm(p: Partner): CreatePartnerInput {
  return {
    name: p.name, logoUrl: p.logoUrl ?? "", websiteUrl: p.websiteUrl ?? "",
    descEN: p.descEN ?? "", descAZ: p.descAZ ?? "", descRU: p.descRU ?? "",
    isActive: p.isActive, order: p.order,
  };
}

function cleanPayload(form: CreatePartnerInput): CreatePartnerInput {
  return {
    name: form.name.trim(),
    logoUrl: form.logoUrl?.trim() || null,
    websiteUrl: form.websiteUrl?.trim() || null,
    descEN: form.descEN?.trim() || null,
    descAZ: form.descAZ?.trim() || null,
    descRU: form.descRU?.trim() || null,
    isActive: form.isActive,
    order: form.order,
  };
}

const descKey = (l: LangKey) => `desc${l}` as keyof CreatePartnerInput;

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    try {
      return new URL(`https://${url}`).hostname;
    } catch {
      return url;
    }
  }
}

export default function PartnersClient({ t }: { t: Dict }) {
  const { data: partners = [], isLoading } = useGetPartnersQuery();
  const [create, { isLoading: creating }] = useCreatePartnerMutation();
  const [update, { isLoading: updating }] = useUpdatePartnerMutation();
  const [deletePartner, { isLoading: deleting }] = useDeletePartnerMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState<CreatePartnerInput>(emptyForm());
  const [activeLang, setActiveLang] = useState<LangKey>("EN");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null); setForm(emptyForm()); setError(""); setSuccess(""); setActiveLang("EN"); setOpen(true);
  }
  function openEdit(p: Partner) {
    setEditing(p); setForm(partnerToForm(p)); setError(""); setSuccess(""); setActiveLang("EN"); setOpen(true);
  }
  function handleOpenChange(v: boolean) {
    if (!v) { setOpen(false); setEditing(null); }
  }

  function set<K extends keyof CreatePartnerInput>(key: K, value: CreatePartnerInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name is required."); return; }
    try {
      const payload = cleanPayload(form);
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
      await deletePartner(pendingDeleteId).unwrap();
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
          <h1 className="dash-page-title">{t.dash.partners ?? "Partners"}</h1>
          <p className="dash-page-sub">Manage partner logos, descriptions, and website links.</p>
        </div>
        <Button type="button" size="sm" onClick={openCreate} style={{ flexShrink: 0 }}>
          + {t.dash.add ?? "Add Partner"}
        </Button>
      </div>

      {isLoading ? (
        <p className="muted">{t.common.loading}</p>
      ) : partners.length === 0 ? (
        <div className="dash-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.3 }}><path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857"/><path d="M9 20H4v-2a3 3 0 0 1 5.356-1.857"/><circle cx="12" cy="7" r="4"/></svg>
          <p>{t.dash.noData}</p>
          <Button type="button" size="sm" variant="outline" className="dash-empty__cta" onClick={openCreate}>
            {t.dash.add ?? "Add Partner"}
          </Button>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>{t.dash.name}</th>
                <th>Website</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.logoUrl
                      ? <img src={p.logoUrl} alt={p.name} className="dash-thumb" />
                      : <div className="dash-thumb-placeholder"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
                    }
                  </td>
                  <td>{p.name}</td>
                  <td>
                    {p.websiteUrl
                      ? <a href={p.websiteUrl.startsWith("http") ? p.websiteUrl : `https://${p.websiteUrl}`} target="_blank" rel="noreferrer" style={{ color: "var(--blue)" }}>{hostnameOf(p.websiteUrl)}</a>
                      : "—"}
                  </td>
                  <td>{p.order}</td>
                  <td>
                    <span className={`status-badge ${p.isActive ? "status-badge--ok" : "status-badge--off"}`}>
                      {p.isActive ? "Active" : "Off"}
                    </span>
                  </td>
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
        title="Delete this partner?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent size="wide" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--cyan"><Handshake size={20} strokeWidth={2} color="#fff" /></div>
              <div>
                <DialogTitle>{editing ? (t.dash.edit ?? "Edit") : (t.dash.add ?? "Add")} Partner</DialogTitle>
                <DialogDescription>Partner details and multilingual description.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogForm id="partner-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>
              {error && <p className="pf-alert pf-alert--error" role="alert">{error}</p>}
              {success && <p className="notice notice--ok mb-3">{success}</p>}

              <div className="pf-field" style={{ marginBottom: 12 }}>
                <label htmlFor="p-name" className="pf-label">Name *</label>
                <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)}
                  disabled={busy} maxLength={200} className="pf-input" />
              </div>

              <ImageUpload
                value={form.logoUrl ?? ""}
                onChange={(url) => set("logoUrl", url)}
                disabled={busy}
                label="Logo"
                hint="PNG or SVG on white/transparent background"
              />

              <div className="pf-field" style={{ marginTop: 12 }}>
                <label htmlFor="p-websiteUrl" className="pf-label">Website</label>
                <Input id="p-websiteUrl" type="url" value={form.websiteUrl ?? ""}
                  onChange={(e) => set("websiteUrl", e.target.value)}
                  disabled={busy} placeholder="https://partner.com" className="pf-input" />
              </div>

              <div className="pf-lang-tabs" style={{ marginTop: 16 }} role="tablist">
                {LANGS.map((l) => (
                  <button key={l} type="button" role="tab" aria-selected={activeLang === l}
                    className={`pf-lang-tab${activeLang === l ? " is-active" : ""}`}
                    onClick={() => setActiveLang(l)}>
                    {l}
                  </button>
                ))}
              </div>

              {LANGS.map((l) => (
                <div key={l} className="pf-field" style={{ display: activeLang === l ? "flex" : "none", marginTop: 8 }}>
                  <label htmlFor={`p-desc-${l}`} className="pf-label">Description {l}</label>
                  <textarea
                    id={`p-desc-${l}`}
                    rows={4}
                    className="pf-textarea"
                    value={(form[descKey(l)] as string) ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [descKey(l)]: e.target.value }))}
                    disabled={busy}
                    placeholder={`Partner description in ${l}…`}
                  />
                </div>
              ))}

              <div className="pf-grid-2" style={{ marginTop: 16 }}>
                <div className="pf-field">
                  <label htmlFor="p-order" className="pf-label">{t.dash.formOrder ?? "Order"}</label>
                  <Input id="p-order" type="number" value={String(form.order)}
                    onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                    disabled={busy} className="pf-input" />
                </div>
                <div className="pf-field">
                  <label htmlFor="p-active" className="pf-label">{t.dash.formActive ?? "Active"}</label>
                  <div className="dash-check-wrap">
                    <input id="p-active" type="checkbox" className="dash-check" checked={form.isActive}
                      onChange={(e) => set("isActive", e.target.checked)}
                      disabled={busy} />
                    <span style={{ fontSize: ".875rem", color: "var(--text)" }}>
                      {form.isActive ? "Partner is visible" : "Partner is hidden"}
                    </span>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" form="partner-form" disabled={busy}>
                {busy ? "Saving…" : (editing ? t.dash.save : "Create Partner")}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
