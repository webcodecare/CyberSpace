"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/dashboard/ImageUpload";
import SkeletonTableRows from "@/components/dashboard/SkeletonTableRows";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogForm,
} from "@/components/ui/dialog";
import { Sparkles, Cpu, Images as ImagesIcon, Briefcase, Inbox } from "lucide-react";
import {
  useGetCareerPageQuery,
  useUpdateCareerPageMutation,
  useGetCareerBenefitsQuery,
  useCreateCareerBenefitMutation,
  useUpdateCareerBenefitMutation,
  useDeleteCareerBenefitMutation,
  useGetCareerExpertiseQuery,
  useCreateCareerExpertiseMutation,
  useUpdateCareerExpertiseMutation,
  useDeleteCareerExpertiseMutation,
  useGetCareerGalleryQuery,
  useCreateCareerGalleryImageMutation,
  useUpdateCareerGalleryImageMutation,
  useDeleteCareerGalleryImageMutation,
  useGetCareerOpportunitiesQuery,
  useCreateCareerOpportunityMutation,
  useUpdateCareerOpportunityMutation,
  useDeleteCareerOpportunityMutation,
  useGetCareerApplicationsQuery,
  useGetCareerApplicationByIdQuery,
  useUpdateCareerApplicationStatusMutation,
  useDeleteCareerApplicationMutation,
  type CareerBenefit,
  type CreateCareerBenefitInput,
  type CareerExpertise,
  type CreateCareerExpertiseInput,
  type CareerGalleryImage,
  type CreateCareerGalleryImageInput,
  type CareerOpportunity,
  type CreateCareerOpportunityInput,
  type CareerApplicationStatus,
  type UpdateCareerPageInput,
} from "@/redux/fetchers/career/careerApi";

type LangKey = "EN" | "AZ" | "RU";
const LANGS: LangKey[] = ["EN", "AZ", "RU"];
type TabKey = "page" | "benefits" | "expertise" | "gallery" | "opportunities" | "applications";

const LangTabs = ({ active, onChange }: { active: LangKey; onChange: (l: LangKey) => void }) => (
  <div className="pf-lang-tabs" role="tablist">
    {LANGS.map((l) => (
      <button
        key={l}
        type="button"
        role="tab"
        aria-selected={active === l}
        className={`pf-lang-tab${active === l ? " is-active" : ""}`}
        onClick={() => onChange(l)}
      >
        {l}
      </button>
    ))}
  </div>
);

export default function CareersClient({ t }: { t: Dict }) {
  const [tab, setTab] = useState<TabKey>("page");
  const TABS: { key: TabKey; label: string }[] = [
    { key: "page", label: "Page Settings" },
    { key: "benefits", label: "Benefits" },
    { key: "expertise", label: "Expertise" },
    { key: "gallery", label: "Gallery" },
    { key: "opportunities", label: "Opportunities" },
    { key: "applications", label: "Applications" },
  ];

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.careers ?? "Careers"}</h1>
          <p className="dash-page-sub">
            Manage the public Career page content, listings and applications.
          </p>
        </div>
      </div>

      <div className="pf-lang-tabs" role="tablist" style={{ marginBottom: 24 }}>
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            role="tab"
            aria-selected={tab === tb.key}
            className={`pf-lang-tab${tab === tb.key ? " is-active" : ""}`}
            onClick={() => setTab(tb.key)}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "page" && <PageSettingsSection />}
      {tab === "benefits" && <BenefitsSection t={t} />}
      {tab === "expertise" && <ExpertiseSection t={t} />}
      {tab === "gallery" && <GallerySection t={t} />}
      {tab === "opportunities" && <OpportunitiesSection t={t} />}
      {tab === "applications" && <ApplicationsSection />}
    </div>
  );
}

/* ══════════════════════ Page Settings ══════════════════════ */

function PageSettingsSection() {
  const { data: page, isLoading, isError, refetch } = useGetCareerPageQuery();
  const [update, { isLoading: saving }] = useUpdateCareerPageMutation();
  const [activeLang, setActiveLang] = useState<LangKey>("EN");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<UpdateCareerPageInput | null>(null);

  if (isLoading) {
    return (
      <div className="dash-table-wrap" style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {LANGS.map((l) => (
            <span key={l} className="skel skel--badge" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, section) => (
          <div key={section} style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <span className="skel skel--lg" style={{ width: 180 }} />
            </div>
            <div style={{ marginBottom: 8, marginTop: 20 }}>
              <span className="skel skel--sm" style={{ width: 120 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <span className="skel skel--xl" />
            </div>
            <div style={{ marginBottom: 8 }}>
              <span className="skel skel--sm" style={{ width: 120 }} />
            </div>
            <div>
              <span className="skel skel--xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (isError || !page) {
    return (
      <div className="dash-empty">
        <p>Failed to load Career page settings.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  const f = form ?? page;

  function set<K extends keyof UpdateCareerPageInput>(key: K, value: UpdateCareerPageInput[K]) {
    setForm((prev) => ({ ...(prev ?? page), [key]: value }));
  }
  const lkey = (base: string, l: LangKey) => `${base}${l}` as keyof UpdateCareerPageInput;

  async function handleSave() {
    if (!form) return;
    await update(form)
      .unwrap()
      .catch(() => {});
    setSuccess("Saved!");
    setTimeout(() => setSuccess(""), 1500);
  }

  return (
    <div className="dash-table-wrap" style={{ padding: 24 }}>
      {success && <p className="notice notice--ok mb-3">{success}</p>}
      <LangTabs active={activeLang} onChange={setActiveLang} />

      <h3 style={{ margin: "20px 0 10px" }}>Hero Section</h3>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Hero Title ({activeLang})</label>
        <Input
          value={(f[lkey("heroTitle", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("heroTitle", activeLang), e.target.value)}
          className="pf-input"
        />
      </div>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Hero Description ({activeLang})</label>
        <textarea
          rows={3}
          className="pf-textarea"
          value={(f[lkey("heroDesc", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("heroDesc", activeLang), e.target.value)}
        />
      </div>
      <div className="pf-grid-2" style={{ marginBottom: 12 }}>
        <div className="pf-field">
          <label className="pf-label">Primary CTA Label ({activeLang})</label>
          <Input
            value={(f[lkey("heroCta1", activeLang)] as string) ?? ""}
            onChange={(e) => set(lkey("heroCta1", activeLang), e.target.value)}
            className="pf-input"
          />
        </div>
        <div className="pf-field">
          <label className="pf-label">Secondary CTA Label ({activeLang})</label>
          <Input
            value={(f[lkey("heroCta2", activeLang)] as string) ?? ""}
            onChange={(e) => set(lkey("heroCta2", activeLang), e.target.value)}
            className="pf-input"
          />
        </div>
      </div>
      <ImageUpload
        value={f.heroImageUrl ?? ""}
        onChange={(url) => set("heroImageUrl", url)}
        label="Hero Image"
      />

      <h3 style={{ margin: "28px 0 10px" }}>About / Introduction</h3>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Heading ({activeLang})</label>
        <Input
          value={(f[lkey("introHeading", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("introHeading", activeLang), e.target.value)}
          className="pf-input"
        />
      </div>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Body ({activeLang})</label>
        <textarea
          rows={4}
          className="pf-textarea"
          value={(f[lkey("introBody", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("introBody", activeLang), e.target.value)}
        />
      </div>
      <ImageUpload
        value={f.introImageUrl ?? ""}
        onChange={(url) => set("introImageUrl", url)}
        label="Introduction Image"
      />

      <h3 style={{ margin: "28px 0 10px" }}>Mission & Vision</h3>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Mission ({activeLang})</label>
        <textarea
          rows={3}
          className="pf-textarea"
          value={(f[lkey("mission", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("mission", activeLang), e.target.value)}
        />
      </div>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Vision ({activeLang})</label>
        <textarea
          rows={3}
          className="pf-textarea"
          value={(f[lkey("vision", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("vision", activeLang), e.target.value)}
        />
      </div>

      <h3 style={{ margin: "28px 0 10px" }}>Culture Section</h3>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Heading ({activeLang})</label>
        <Input
          value={(f[lkey("cultureHeading", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("cultureHeading", activeLang), e.target.value)}
          className="pf-input"
        />
      </div>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">Body ({activeLang})</label>
        <textarea
          rows={3}
          className="pf-textarea"
          value={(f[lkey("cultureBody", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("cultureBody", activeLang), e.target.value)}
        />
      </div>

      <h3 style={{ margin: "28px 0 10px" }}>SEO ({activeLang})</h3>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">SEO Title</label>
        <Input
          value={(f[lkey("seoTitle", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("seoTitle", activeLang), e.target.value)}
          className="pf-input"
        />
      </div>
      <div className="pf-field" style={{ marginBottom: 12 }}>
        <label className="pf-label">SEO Description</label>
        <textarea
          rows={2}
          className="pf-textarea"
          value={(f[lkey("seoDesc", activeLang)] as string) ?? ""}
          onChange={(e) => set(lkey("seoDesc", activeLang), e.target.value)}
        />
      </div>

      <div className="dash-check-wrap" style={{ marginTop: 16, marginBottom: 20 }}>
        <input
          type="checkbox"
          className="dash-check"
          checked={f.isPublished ?? true}
          onChange={(e) => set("isPublished", e.target.checked)}
        />
        <span style={{ fontSize: ".875rem", color: "var(--text)" }}>
          {(f.isPublished ?? true)
            ? "Career page is published"
            : "Career page is hidden from the public site"}
        </span>
      </div>

      <Button type="button" onClick={handleSave} disabled={saving || !form}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}

/* ══════════════════════ Benefits ══════════════════════ */

const emptyBenefit = (): CreateCareerBenefitInput => ({
  icon: "",
  imageUrl: "",
  titleEN: "",
  titleAZ: "",
  titleRU: "",
  descEN: "",
  descAZ: "",
  descRU: "",
  isActive: true,
  order: 0,
});

function benefitToForm(b: CareerBenefit): CreateCareerBenefitInput {
  return {
    icon: b.icon ?? "",
    imageUrl: b.imageUrl ?? "",
    titleEN: b.titleEN,
    titleAZ: b.titleAZ,
    titleRU: b.titleRU,
    descEN: b.descEN ?? "",
    descAZ: b.descAZ ?? "",
    descRU: b.descRU ?? "",
    isActive: b.isActive,
    order: b.order,
  };
}

function BenefitsSection({ t }: { t: Dict }) {
  const { data: benefits = [], isLoading } = useGetCareerBenefitsQuery();
  const [create, { isLoading: creating }] = useCreateCareerBenefitMutation();
  const [update, { isLoading: updating }] = useUpdateCareerBenefitMutation();
  const [deleteBenefit, { isLoading: deleting }] = useDeleteCareerBenefitMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareerBenefit | null>(null);
  const [form, setForm] = useState<CreateCareerBenefitInput>(emptyBenefit());
  const [activeLang, setActiveLang] = useState<LangKey>("EN");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyBenefit());
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function openEdit(b: CareerBenefit) {
    setEditing(b);
    setForm(benefitToForm(b));
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function set<K extends keyof CreateCareerBenefitInput>(
    key: K,
    value: CreateCareerBenefitInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  const titleKey = (l: LangKey) => `title${l}` as keyof CreateCareerBenefitInput;
  const descKey = (l: LangKey) => `desc${l}` as keyof CreateCareerBenefitInput;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.titleEN.trim()) {
      setError("English title is required.");
      return;
    }
    try {
      const payload = {
        ...form,
        imageUrl: form.imageUrl?.trim() || null,
        icon: form.icon?.trim() || null,
      };
      if (editing) await update({ id: editing.id, body: payload }).unwrap();
      else await create(payload).unwrap();
      setOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ?? "Save failed. Please try again.",
      );
    }
  }
  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    await deleteBenefit(pendingDeleteId)
      .unwrap()
      .catch(() => {});
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  const busy = creating || updating;

  return (
    <div>
      <div className="dash-page-header">
        <p className="dash-page-sub">
          Benefit cards shown in the &ldquo;Why Join Our Team?&rdquo; section.
        </p>
        <Button type="button" size="sm" onClick={openCreate}>
          + {t.dash.add ?? "Add"} Benefit
        </Button>
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRows columns={["sm", "text", "sm", "badge", "badge"]} />
            </tbody>
          </table>
        </div>
      ) : benefits.length === 0 ? (
        <div className="dash-empty">
          <p>{t.dash.noData}</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontSize: "1.3rem" }}>{b.icon ?? "—"}</td>
                  <td>{b.titleEN}</td>
                  <td>{b.order}</td>
                  <td>
                    <span
                      className={`status-badge ${b.isActive ? "status-badge--ok" : "status-badge--off"}`}
                    >
                      {b.isActive ? "Active" : "Off"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(b)}>
                        {t.dash.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deleting}
                        onClick={() => {
                          setPendingDeleteId(b.id);
                          setConfirmOpen(true);
                        }}
                      >
                        {t.dash.delete}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this benefit?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent size="wide" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--cyan">
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <DialogTitle>{editing ? t.dash.edit : t.dash.add} Benefit</DialogTitle>
                <DialogDescription>Benefit card shown on the Career page.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogForm id="benefit-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>
              {error && (
                <p className="pf-alert pf-alert--error" role="alert">
                  {error}
                </p>
              )}
              <div className="pf-grid-2" style={{ marginBottom: 12 }}>
                <div className="pf-field">
                  <label className="pf-label">Icon (emoji)</label>
                  <Input
                    value={form.icon ?? ""}
                    onChange={(e) => set("icon", e.target.value)}
                    placeholder="🚀"
                    maxLength={8}
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{t.dash.formOrder ?? "Order"}</label>
                  <Input
                    type="number"
                    value={String(form.order)}
                    onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
              </div>
              <ImageUpload
                value={form.imageUrl ?? ""}
                onChange={(url) => set("imageUrl", url)}
                label="Image (optional)"
              />
              <LangTabs active={activeLang} onChange={setActiveLang} />
              <div className="pf-field" style={{ marginTop: 10 }}>
                <label className="pf-label">
                  Title ({activeLang}) {activeLang === "EN" && "*"}
                </label>
                <Input
                  value={(form[titleKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [titleKey(activeLang)]: e.target.value }))
                  }
                  className="pf-input"
                  disabled={busy}
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Description ({activeLang})</label>
                <textarea
                  rows={3}
                  className="pf-textarea"
                  value={(form[descKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [descKey(activeLang)]: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="dash-check-wrap" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  className="dash-check"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  disabled={busy}
                />
                <span style={{ fontSize: ".875rem" }}>{form.isActive ? "Visible" : "Hidden"}</span>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="benefit-form" disabled={busy}>
                {busy ? "Saving…" : t.dash.save}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════ Expertise ══════════════════════ */

const emptyExpertise = (): CreateCareerExpertiseInput => ({
  icon: "",
  titleEN: "",
  titleAZ: "",
  titleRU: "",
  descEN: "",
  descAZ: "",
  descRU: "",
  isActive: true,
  order: 0,
});
function expertiseToForm(e: CareerExpertise): CreateCareerExpertiseInput {
  return {
    icon: e.icon ?? "",
    titleEN: e.titleEN,
    titleAZ: e.titleAZ,
    titleRU: e.titleRU,
    descEN: e.descEN ?? "",
    descAZ: e.descAZ ?? "",
    descRU: e.descRU ?? "",
    isActive: e.isActive,
    order: e.order,
  };
}

function ExpertiseSection({ t }: { t: Dict }) {
  const { data: items = [], isLoading } = useGetCareerExpertiseQuery();
  const [create, { isLoading: creating }] = useCreateCareerExpertiseMutation();
  const [update, { isLoading: updating }] = useUpdateCareerExpertiseMutation();
  const [deleteExpertise, { isLoading: deleting }] = useDeleteCareerExpertiseMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareerExpertise | null>(null);
  const [form, setForm] = useState<CreateCareerExpertiseInput>(emptyExpertise());
  const [activeLang, setActiveLang] = useState<LangKey>("EN");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyExpertise());
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function openEdit(e: CareerExpertise) {
    setEditing(e);
    setForm(expertiseToForm(e));
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function set<K extends keyof CreateCareerExpertiseInput>(
    key: K,
    value: CreateCareerExpertiseInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  const titleKey = (l: LangKey) => `title${l}` as keyof CreateCareerExpertiseInput;
  const descKey = (l: LangKey) => `desc${l}` as keyof CreateCareerExpertiseInput;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.titleEN.trim()) {
      setError("English title is required.");
      return;
    }
    try {
      const payload = { ...form, icon: form.icon?.trim() || null };
      if (editing) await update({ id: editing.id, body: payload }).unwrap();
      else await create(payload).unwrap();
      setOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ?? "Save failed. Please try again.",
      );
    }
  }
  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    await deleteExpertise(pendingDeleteId)
      .unwrap()
      .catch(() => {});
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  const busy = creating || updating;

  return (
    <div>
      <div className="dash-page-header">
        <p className="dash-page-sub">
          Technology domains shown in the &ldquo;Our Technology &amp; Expertise&rdquo; section.
        </p>
        <Button type="button" size="sm" onClick={openCreate}>
          + {t.dash.add ?? "Add"} Expertise
        </Button>
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRows columns={["sm", "text", "sm", "badge", "badge"]} />
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <div className="dash-empty">
          <p>{t.dash.noData}</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontSize: "1.3rem" }}>{e.icon ?? "—"}</td>
                  <td>{e.titleEN}</td>
                  <td>{e.order}</td>
                  <td>
                    <span
                      className={`status-badge ${e.isActive ? "status-badge--ok" : "status-badge--off"}`}
                    >
                      {e.isActive ? "Active" : "Off"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(e)}>
                        {t.dash.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deleting}
                        onClick={() => {
                          setPendingDeleteId(e.id);
                          setConfirmOpen(true);
                        }}
                      >
                        {t.dash.delete}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this expertise card?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent size="wide" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--cyan">
                <Cpu size={20} color="#fff" />
              </div>
              <div>
                <DialogTitle>{editing ? t.dash.edit : t.dash.add} Expertise</DialogTitle>
                <DialogDescription>Technology domain shown on the Career page.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogForm id="expertise-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>
              {error && (
                <p className="pf-alert pf-alert--error" role="alert">
                  {error}
                </p>
              )}
              <div className="pf-grid-2" style={{ marginBottom: 12 }}>
                <div className="pf-field">
                  <label className="pf-label">Icon (emoji)</label>
                  <Input
                    value={form.icon ?? ""}
                    onChange={(e) => set("icon", e.target.value)}
                    placeholder="🖥️"
                    maxLength={8}
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{t.dash.formOrder ?? "Order"}</label>
                  <Input
                    type="number"
                    value={String(form.order)}
                    onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
              </div>
              <LangTabs active={activeLang} onChange={setActiveLang} />
              <div className="pf-field" style={{ marginTop: 10 }}>
                <label className="pf-label">
                  Title ({activeLang}) {activeLang === "EN" && "*"}
                </label>
                <Input
                  value={(form[titleKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [titleKey(activeLang)]: e.target.value }))
                  }
                  className="pf-input"
                  disabled={busy}
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Description ({activeLang})</label>
                <textarea
                  rows={3}
                  className="pf-textarea"
                  value={(form[descKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [descKey(activeLang)]: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="dash-check-wrap" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  className="dash-check"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  disabled={busy}
                />
                <span style={{ fontSize: ".875rem" }}>{form.isActive ? "Visible" : "Hidden"}</span>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="expertise-form" disabled={busy}>
                {busy ? "Saving…" : t.dash.save}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════ Gallery ══════════════════════ */

const emptyGalleryImage = (): CreateCareerGalleryImageInput => ({
  imageUrl: "",
  captionEN: "",
  captionAZ: "",
  captionRU: "",
  isActive: true,
  order: 0,
});
function galleryToForm(g: CareerGalleryImage): CreateCareerGalleryImageInput {
  return {
    imageUrl: g.imageUrl,
    captionEN: g.captionEN ?? "",
    captionAZ: g.captionAZ ?? "",
    captionRU: g.captionRU ?? "",
    isActive: g.isActive,
    order: g.order,
  };
}

function GallerySection({ t }: { t: Dict }) {
  const { data: images = [], isLoading } = useGetCareerGalleryQuery();
  const [create, { isLoading: creating }] = useCreateCareerGalleryImageMutation();
  const [update, { isLoading: updating }] = useUpdateCareerGalleryImageMutation();
  const [deleteImage, { isLoading: deleting }] = useDeleteCareerGalleryImageMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareerGalleryImage | null>(null);
  const [form, setForm] = useState<CreateCareerGalleryImageInput>(emptyGalleryImage());
  const [activeLang, setActiveLang] = useState<LangKey>("EN");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyGalleryImage());
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function openEdit(g: CareerGalleryImage) {
    setEditing(g);
    setForm(galleryToForm(g));
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function set<K extends keyof CreateCareerGalleryImageInput>(
    key: K,
    value: CreateCareerGalleryImageInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  const captionKey = (l: LangKey) => `caption${l}` as keyof CreateCareerGalleryImageInput;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.imageUrl.trim()) {
      setError("Please upload an image.");
      return;
    }
    try {
      if (editing) await update({ id: editing.id, body: form }).unwrap();
      else await create(form).unwrap();
      setOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ?? "Save failed. Please try again.",
      );
    }
  }
  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    await deleteImage(pendingDeleteId)
      .unwrap()
      .catch(() => {});
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  const busy = creating || updating;

  return (
    <div>
      <div className="dash-page-header">
        <p className="dash-page-sub">Photo gallery shown in &ldquo;Life at Cyberspace&rdquo;.</p>
        <Button type="button" size="sm" onClick={openCreate}>
          + {t.dash.add ?? "Add"} Image
        </Button>
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Caption</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRows columns={["thumb", "text", "sm", "badge", "badge"]} />
            </tbody>
          </table>
        </div>
      ) : images.length === 0 ? (
        <div className="dash-empty">
          <p>{t.dash.noData}</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Caption</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {images.map((g) => (
                <tr key={g.id}>
                  <td>
                    <img src={g.imageUrl} alt="" className="dash-thumb" />
                  </td>
                  <td>{g.captionEN ?? "—"}</td>
                  <td>{g.order}</td>
                  <td>
                    <span
                      className={`status-badge ${g.isActive ? "status-badge--ok" : "status-badge--off"}`}
                    >
                      {g.isActive ? "Active" : "Off"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(g)}>
                        {t.dash.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deleting}
                        onClick={() => {
                          setPendingDeleteId(g.id);
                          setConfirmOpen(true);
                        }}
                      >
                        {t.dash.delete}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this image?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent size="wide" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--cyan">
                <ImagesIcon size={20} color="#fff" />
              </div>
              <div>
                <DialogTitle>{editing ? t.dash.edit : t.dash.add} Gallery Image</DialogTitle>
                <DialogDescription>Photo shown in the Career page gallery.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogForm id="gallery-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>
              {error && (
                <p className="pf-alert pf-alert--error" role="alert">
                  {error}
                </p>
              )}
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => set("imageUrl", url)}
                label="Image *"
              />
              <LangTabs active={activeLang} onChange={setActiveLang} />
              <div className="pf-field" style={{ marginTop: 10 }}>
                <label className="pf-label">Caption ({activeLang})</label>
                <Input
                  value={(form[captionKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [captionKey(activeLang)]: e.target.value }))
                  }
                  className="pf-input"
                  disabled={busy}
                />
              </div>
              <div className="pf-grid-2" style={{ marginTop: 12 }}>
                <div className="pf-field">
                  <label className="pf-label">{t.dash.formOrder ?? "Order"}</label>
                  <Input
                    type="number"
                    value={String(form.order)}
                    onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
                <div className="dash-check-wrap" style={{ alignSelf: "center" }}>
                  <input
                    type="checkbox"
                    className="dash-check"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    disabled={busy}
                  />
                  <span style={{ fontSize: ".875rem" }}>
                    {form.isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="gallery-form" disabled={busy}>
                {busy ? "Saving…" : t.dash.save}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════ Opportunities ══════════════════════ */

const emptyOpportunity = (): CreateCareerOpportunityInput => ({
  titleEN: "",
  titleAZ: "",
  titleRU: "",
  department: "",
  location: "",
  typeEN: "",
  typeAZ: "",
  typeRU: "",
  descEN: "",
  descAZ: "",
  descRU: "",
  isActive: true,
  order: 0,
});
function opportunityToForm(o: CareerOpportunity): CreateCareerOpportunityInput {
  return {
    titleEN: o.titleEN,
    titleAZ: o.titleAZ,
    titleRU: o.titleRU,
    department: o.department ?? "",
    location: o.location ?? "",
    typeEN: o.typeEN ?? "",
    typeAZ: o.typeAZ ?? "",
    typeRU: o.typeRU ?? "",
    descEN: o.descEN ?? "",
    descAZ: o.descAZ ?? "",
    descRU: o.descRU ?? "",
    isActive: o.isActive,
    order: o.order,
  };
}

function OpportunitiesSection({ t }: { t: Dict }) {
  const { data: items = [], isLoading } = useGetCareerOpportunitiesQuery();
  const [create, { isLoading: creating }] = useCreateCareerOpportunityMutation();
  const [update, { isLoading: updating }] = useUpdateCareerOpportunityMutation();
  const [deleteOpportunity, { isLoading: deleting }] = useDeleteCareerOpportunityMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareerOpportunity | null>(null);
  const [form, setForm] = useState<CreateCareerOpportunityInput>(emptyOpportunity());
  const [activeLang, setActiveLang] = useState<LangKey>("EN");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyOpportunity());
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function openEdit(o: CareerOpportunity) {
    setEditing(o);
    setForm(opportunityToForm(o));
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function set<K extends keyof CreateCareerOpportunityInput>(
    key: K,
    value: CreateCareerOpportunityInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  const titleKey = (l: LangKey) => `title${l}` as keyof CreateCareerOpportunityInput;
  const typeKey = (l: LangKey) => `type${l}` as keyof CreateCareerOpportunityInput;
  const descKey = (l: LangKey) => `desc${l}` as keyof CreateCareerOpportunityInput;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.titleEN.trim()) {
      setError("English title is required.");
      return;
    }
    try {
      const payload = {
        ...form,
        department: form.department?.trim() || null,
        location: form.location?.trim() || null,
      };
      if (editing) await update({ id: editing.id, body: payload }).unwrap();
      else await create(payload).unwrap();
      setOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ?? "Save failed. Please try again.",
      );
    }
  }
  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    await deleteOpportunity(pendingDeleteId)
      .unwrap()
      .catch(() => {});
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  const busy = creating || updating;

  return (
    <div>
      <div className="dash-page-header">
        <p className="dash-page-sub">
          Open positions shown in the &ldquo;Career Opportunities&rdquo; section.
        </p>
        <Button type="button" size="sm" onClick={openCreate}>
          + {t.dash.add ?? "Add"} Opportunity
        </Button>
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRows columns={["text", "text", "text", "sm", "badge", "badge"]} />
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <div className="dash-empty">
          <p>{t.dash.noData}</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>{t.dash.formOrder ?? "Order"}</th>
                <th>{t.dash.formActive ?? "Active"}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>{o.titleEN}</td>
                  <td>{o.department ?? "—"}</td>
                  <td>{o.location ?? "—"}</td>
                  <td>{o.order}</td>
                  <td>
                    <span
                      className={`status-badge ${o.isActive ? "status-badge--ok" : "status-badge--off"}`}
                    >
                      {o.isActive ? "Active" : "Off"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(o)}>
                        {t.dash.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deleting}
                        onClick={() => {
                          setPendingDeleteId(o.id);
                          setConfirmOpen(true);
                        }}
                      >
                        {t.dash.delete}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this opportunity?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent size="wide" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--cyan">
                <Briefcase size={20} color="#fff" />
              </div>
              <div>
                <DialogTitle>{editing ? t.dash.edit : t.dash.add} Opportunity</DialogTitle>
                <DialogDescription>Open position shown on the Career page.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogForm id="opportunity-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>
              {error && (
                <p className="pf-alert pf-alert--error" role="alert">
                  {error}
                </p>
              )}
              <div className="pf-grid-2" style={{ marginBottom: 12 }}>
                <div className="pf-field">
                  <label className="pf-label">Department</label>
                  <Input
                    value={form.department ?? ""}
                    onChange={(e) => set("department", e.target.value)}
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Location</label>
                  <Input
                    value={form.location ?? ""}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="Baku"
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
              </div>
              <LangTabs active={activeLang} onChange={setActiveLang} />
              <div className="pf-field" style={{ marginTop: 10 }}>
                <label className="pf-label">
                  Title ({activeLang}) {activeLang === "EN" && "*"}
                </label>
                <Input
                  value={(form[titleKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [titleKey(activeLang)]: e.target.value }))
                  }
                  className="pf-input"
                  disabled={busy}
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Employment Type ({activeLang})</label>
                <Input
                  value={(form[typeKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [typeKey(activeLang)]: e.target.value }))
                  }
                  placeholder="Full-time · On-site"
                  className="pf-input"
                  disabled={busy}
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Description ({activeLang})</label>
                <textarea
                  rows={3}
                  className="pf-textarea"
                  value={(form[descKey(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [descKey(activeLang)]: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="pf-grid-2" style={{ marginTop: 12 }}>
                <div className="pf-field">
                  <label className="pf-label">{t.dash.formOrder ?? "Order"}</label>
                  <Input
                    type="number"
                    value={String(form.order)}
                    onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                    className="pf-input"
                    disabled={busy}
                  />
                </div>
                <div className="dash-check-wrap" style={{ alignSelf: "center" }}>
                  <input
                    type="checkbox"
                    className="dash-check"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    disabled={busy}
                  />
                  <span style={{ fontSize: ".875rem" }}>
                    {form.isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="opportunity-form" disabled={busy}>
                {busy ? "Saving…" : t.dash.save}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════ Applications ══════════════════════ */

const STATUS_OPTIONS: CareerApplicationStatus[] = ["NEW", "REVIEWED", "SHORTLISTED", "REJECTED"];
const statusBadgeClass: Record<CareerApplicationStatus, string> = {
  NEW: "status-badge--new",
  REVIEWED: "status-badge--draft",
  SHORTLISTED: "status-badge--ok",
  REJECTED: "status-badge--off",
};

function ApplicationsSection() {
  const { data: applications = [], isLoading } = useGetCareerApplicationsQuery();
  const [deleteApplication, { isLoading: deleting }] = useDeleteCareerApplicationMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    await deleteApplication(pendingDeleteId)
      .unwrap()
      .catch(() => {});
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  return (
    <div>
      <div className="dash-page-header">
        <p className="dash-page-sub">Candidate applications submitted through the Career page.</p>
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRows columns={["text", "text", "text", "badge", "sm", "badge"]} />
            </tbody>
          </table>
        </div>
      ) : applications.length === 0 ? (
        <div className="dash-empty">
          <p>No applications yet.</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td>{a.fullName}</td>
                  <td>{a.positionApplied}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className={`status-badge ${statusBadgeClass[a.status]}`}>{a.status}</span>
                  </td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="dash-actions">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingId(a.id)}
                      >
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deleting}
                        onClick={() => {
                          setPendingDeleteId(a.id);
                          setConfirmOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this application?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {viewingId != null && (
        <ApplicationDetailDialog id={viewingId} onClose={() => setViewingId(null)} />
      )}
    </div>
  );
}

function ApplicationDetailDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: app, isLoading, isError, refetch } = useGetCareerApplicationByIdQuery(id);
  const [updateStatus, { isLoading: updating }] = useUpdateCareerApplicationStatusMutation();

  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent size="wide">
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="dlg-hdr-icon dlg-hdr-icon--cyan">
              <Inbox size={20} color="#fff" />
            </div>
            <div>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>Submitted candidate information and resume.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="pf-grid-2" style={{ marginBottom: 14 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <span className="skel skel--sm" style={{ width: 70, marginBottom: 6 }} />
                  <div>
                    <span className="skel skel--md" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError || !app ? (
            <div className="dash-empty">
              <p>Failed to load application details.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="pf-grid-2" style={{ marginBottom: 14 }}>
                <div>
                  <strong>Full Name</strong>
                  <p>{app.fullName}</p>
                </div>
                <div>
                  <strong>Position</strong>
                  <p>{app.positionApplied}</p>
                </div>
                <div>
                  <strong>Email</strong>
                  <p>{app.email}</p>
                </div>
                <div>
                  <strong>Phone</strong>
                  <p>{app.phone}</p>
                </div>
                {app.country && (
                  <div>
                    <strong>Country</strong>
                    <p>{app.country}</p>
                  </div>
                )}
                {app.yearsExperience != null && (
                  <div>
                    <strong>Experience</strong>
                    <p>{app.yearsExperience} years</p>
                  </div>
                )}
                {app.linkedinUrl && (
                  <div>
                    <strong>LinkedIn</strong>
                    <p>
                      <a href={app.linkedinUrl} target="_blank" rel="noreferrer">
                        {app.linkedinUrl}
                      </a>
                    </p>
                  </div>
                )}
                {app.portfolioUrl && (
                  <div>
                    <strong>Portfolio</strong>
                    <p>
                      <a href={app.portfolioUrl} target="_blank" rel="noreferrer">
                        {app.portfolioUrl}
                      </a>
                    </p>
                  </div>
                )}
              </div>
              {app.coverLetter && (
                <div style={{ marginBottom: 14 }}>
                  <strong>Cover Letter</strong>
                  <p style={{ whiteSpace: "pre-wrap", color: "var(--muted)" }}>{app.coverLetter}</p>
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <strong>Resume</strong>
                <p style={{ marginTop: 6 }}>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`/api/career/applications/${app.id}/resume`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download {app.resumeFileName}
                    </a>
                  </Button>
                </p>
              </div>
              <div className="pf-field">
                <label className="pf-label">Status</label>
                <select
                  className="pf-select"
                  value={app.status}
                  disabled={updating}
                  onChange={(e) =>
                    updateStatus({ id: app.id, status: e.target.value as CareerApplicationStatus })
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
