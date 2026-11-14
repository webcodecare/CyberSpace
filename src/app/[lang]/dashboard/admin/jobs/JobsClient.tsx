"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Users, CheckCircle2, Clock, Inbox } from "lucide-react";
import {
  useGetJobsQuery,
  useGetJobStatsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useSetJobStatusMutation,
  useDeleteJobMutation,
  EMPLOYMENT_LABEL,
  WORKPLACE_LABEL,
  type Job,
  type JobInput,
  type JobTranslation,
  JOB_LANGS,
  type JobLang,
  type JobStatus,
  type EmploymentType,
  type WorkplaceType,
} from "@/redux/fetchers/job/jobApi";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import Pagination from "@/components/dashboard/Pagination";
import SkeletonTableRows from "@/components/dashboard/SkeletonTableRows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
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

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Date-only value (YYYY-MM-DD) in the admin's local time, for <input type="date">. */
const toLocalDate = (iso: string) => toLocalInput(iso).slice(0, 10);

/** The deadline is a date: applications stay open through the end of that day (local time). */
const endOfDay = (date: string) => new Date(`${date}T23:59:59`);

interface TrForm {
  title: string;
  shortDescription: string;
  description: string;
  responsibilities: string;
  requirements: string;
  requiredSkills: string;
  experienceLevel: string;
  educationRequirements: string;
}

interface Form {
  department: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location: string;
  vacancies: string;
  salaryRange: string;
  postedAt: string;
  expiresAt: string;
  status: JobStatus;
  tr: Record<JobLang, TrForm>;
}

const emptyTr = (): TrForm => ({
  title: "",
  shortDescription: "",
  description: "",
  responsibilities: "",
  requirements: "",
  requiredSkills: "",
  experienceLevel: "",
  educationRequirements: "",
});

const emptyForm = (): Form => ({
  department: "",
  employmentType: "FULL_TIME",
  workplaceType: "ON_SITE",
  location: "",
  vacancies: "1",
  salaryRange: "",
  postedAt: toLocalDate(new Date().toISOString()),
  expiresAt: "",
  status: "DRAFT",
  tr: { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() },
});

function jobToForm(j: Job): Form {
  const tr = { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() };
  for (const t of j.translations) {
    tr[t.lang] = {
      title: t.title,
      shortDescription: t.shortDescription ?? "",
      description: t.description,
      responsibilities: t.responsibilities ?? "",
      requirements: t.requirements,
      requiredSkills: t.requiredSkills.join(", "),
      experienceLevel: t.experienceLevel ?? "",
      educationRequirements: t.educationRequirements ?? "",
    };
  }
  return {
    department: j.department,
    employmentType: j.employmentType,
    workplaceType: j.workplaceType,
    location: j.location,
    vacancies: String(j.vacancies),
    salaryRange: j.salaryRange ?? "",
    postedAt: toLocalDate(j.postedAt),
    expiresAt: toLocalDate(j.expiresAt),
    status: j.status,
    tr,
  };
}

const LANG_NAME: Record<JobLang, string> = { EN: "English", AZ: "Azerbaijani", RU: "Russian" };

const plain = (html: string) => html.replace(/<[^>]*>/g, "").trim();

const STATUS_CLASS: Record<JobStatus, string> = {
  DRAFT: "status-badge--draft",
  PUBLISHED: "status-badge--published",
  EXPIRED: "status-badge--expired",
};

/** A published job past its deadline is shown as Expired even before the DB row is synced. */
const shownStatus = (j: Job): JobStatus =>
  j.status === "PUBLISHED" && new Date(j.expiresAt).getTime() <= Date.now() ? "EXPIRED" : j.status;

const errMsg = (e: unknown, fallback: string) => {
  const d = (e as { data?: { message?: string; error?: { message: string; path: string }[] } })?.data;
  const first = d?.error?.[0];
  return first?.path ? `${first.path}: ${first.message}` : (d?.message ?? fallback);
};

export default function JobsClient({ lang }: { lang: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetJobsQuery({ search, status, page, limit });
  const { data: stats, isLoading: statsLoading } = useGetJobStatsQuery();
  const [createJob, { isLoading: creating }] = useCreateJobMutation();
  const [updateJob, { isLoading: updating }] = useUpdateJobMutation();
  const [setJobStatus, { isLoading: toggling }] = useSetJobStatusMutation();
  const [deleteJob, { isLoading: deleting }] = useDeleteJobMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [activeLang, setActiveLang] = useState<JobLang>("EN");
  const [error, setError] = useState("");
  const [rowError, setRowError] = useState("");
  const [toDelete, setToDelete] = useState<Job | null>(null);

  const jobs = data?.data ?? [];
  const busy = creating || updating;
  const set = <K extends Exclude<keyof Form, "tr">>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setTr = <K extends keyof TrForm>(l: JobLang, k: K, v: TrForm[K]) =>
    setForm((f) => ({ ...f, tr: { ...f.tr, [l]: { ...f.tr[l], [k]: v } } }));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function openEdit(j: Job) {
    setEditing(j);
    setForm(jobToForm(j));
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.department.trim()) return setError("Department is required.");
    if (!form.location.trim()) return setError("Location is required.");
    if (!form.expiresAt) return setError("Application expiry date is required.");
    const vacancies = parseInt(form.vacancies, 10);
    if (!Number.isInteger(vacancies) || vacancies < 1) return setError("Vacancies must be at least 1.");
    const expiresAt = endOfDay(form.expiresAt);
    const postedAt = form.postedAt ? new Date(`${form.postedAt}T00:00:00`) : new Date();
    if (expiresAt <= postedAt) return setError("Expiry date must be after the posted date.");
    if (form.status === "PUBLISHED" && expiresAt.getTime() <= Date.now())
      return setError("Expiry date must be in the future to publish.");

    // English is the fallback language and is mandatory; AZ/RU are validated only when started.
    const translations: JobTranslation[] = [];
    for (const l of JOB_LANGS) {
      const f = form.tr[l];
      const started = Object.values(f).some((v) => plain(v));
      if (l !== "EN" && !started) continue;
      const fail = (msg: string) => {
        setActiveLang(l);
        setError(`${LANG_NAME[l]}: ${msg}`);
      };
      if (f.title.trim().length < 2) return fail("job title is required.");
      if (plain(f.description).length < 5) return fail("job description is required.");
      if (plain(f.requirements).length < 5) return fail("requirements and qualifications are required.");
      translations.push({
        lang: l,
        title: f.title.trim(),
        shortDescription: f.shortDescription.trim() || null,
        description: f.description,
        responsibilities: plain(f.responsibilities) ? f.responsibilities : null,
        requirements: f.requirements,
        requiredSkills: f.requiredSkills.split(",").map((x) => x.trim()).filter(Boolean),
        experienceLevel: f.experienceLevel.trim() || null,
        educationRequirements: plain(f.educationRequirements) ? f.educationRequirements : null,
      });
    }

    const body: JobInput = {
      department: form.department.trim(),
      employmentType: form.employmentType,
      workplaceType: form.workplaceType,
      location: form.location.trim(),
      vacancies,
      salaryRange: form.salaryRange.trim() || null,
      postedAt: postedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: form.status,
      translations,
    };
    try {
      if (editing) await updateJob({ id: editing.id, body }).unwrap();
      else await createJob(body).unwrap();
      setOpen(false);
    } catch (err) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  async function toggle(j: Job) {
    setRowError("");
    try {
      await setJobStatus({ id: j.id, status: j.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Could not change status."));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteJob(toDelete.id).unwrap();
      if (jobs.length === 1 && page > 1) setPage(page - 1);
    } catch (err) {
      setRowError(errMsg(err, "Delete failed."));
    }
    setToDelete(null);
  }

  const tiles = [
    { label: "Total Vacancies", value: stats?.totalJobs, icon: <Briefcase size={20} />, tone: "blue" },
    { label: "Active Jobs", value: stats?.activeJobs, icon: <CheckCircle2 size={20} />, tone: "green" },
    { label: "Expired Jobs", value: stats?.expiredJobs, icon: <Clock size={20} />, tone: "amber" },
    { label: "Total Applications", value: stats?.totalApplications, icon: <Users size={20} />, tone: "violet" },
    { label: "Pending Applications", value: stats?.pendingApplications, icon: <Inbox size={20} />, tone: "cyan" },
  ];

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Job Management</h1>
          <p className="dash-page-sub">Create vacancies, set deadlines and track applications.</p>
        </div>
        <Button type="button" size="sm" onClick={openCreate} style={{ flexShrink: 0 }}>
          + New Job
        </Button>
      </div>

      <div className="stat-grid">
        {tiles.map((s) => (
          <div key={s.label} className={`stat-card stat-card--${s.tone}`}>
            <div className="stat-card__icon">{s.icon}</div>
            <div className="stat-card__body">
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value">
                {statsLoading || s.value === undefined ? <span className="skel skel--sm" /> : s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-toolbar">
        <input
          className="dash-search"
          placeholder="Search title, department, location…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div className="dash-filters">
          {(["", "DRAFT", "PUBLISHED", "EXPIRED"] as const).map((s) => (
            <button
              key={s || "all"}
              type="button"
              className={`dash-filter-btn${status === s ? " is-active" : ""}`}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s ? s.charAt(0) + s.slice(1).toLowerCase() : "All"}
            </button>
          ))}
        </div>
      </div>

      {rowError && <p className="pf-alert pf-alert--error" role="alert">{rowError}</p>}

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonTableRows columns={["text", "text", "text", "badge", "sm", "badge"]} />
            ) : isError ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--red)" }}>
                  Failed to load jobs.
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="dash-empty">
                    <Briefcase size={34} style={{ opacity: 0.3 }} />
                    <p>No jobs found.</p>
                    <Button type="button" size="sm" variant="outline" onClick={openCreate}>
                      Create your first job
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              jobs.map((j) => {
                const st = shownStatus(j);
                return (
                  <tr key={j.id}>
                    <td>
                      <strong>{j.title}</strong>
                      <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                        {j.department} · {j.location}
                      </div>
                    </td>
                    <td>
                      {EMPLOYMENT_LABEL[j.employmentType]}
                      <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                        {WORKPLACE_LABEL[j.workplaceType]}
                      </div>
                    </td>
                    <td>{new Date(j.expiresAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[st]}`}>{st}</span>
                    </td>
                    <td>
                      <Link
                        href={`/${lang}/dashboard/admin/applications?jobId=${j.id}`}
                        className="count-badge"
                        title="View applications"
                      >
                        {j._count.applications} {j._count.applications === 1 ? "Application" : "Applications"}
                      </Link>
                    </td>
                    <td>
                      <div className="dash-actions">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEdit(j)}>
                          Edit
                        </Button>
                        {st !== "EXPIRED" && (
                          <Button type="button" variant="outline" size="sm" disabled={toggling} onClick={() => toggle(j)}>
                            {j.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          </Button>
                        )}
                        <Button type="button" variant="destructive" size="sm" onClick={() => setToDelete(j)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} limit={limit} total={data?.meta.total ?? 0} onPage={setPage} />

      {stats && stats.applicationsPerJob.length > 0 && (
        <div className="dash-table-wrap" style={{ marginTop: 20, padding: "14px 18px" }}>
          <h3 style={{ fontSize: ".95rem", marginBottom: 8 }}>Applications per vacancy</h3>
          <ul className="job-count-list">
            {stats.applicationsPerJob.map((j) => (
              <li key={j.id}>
                <span>{j.title}</span>
                <strong>
                  {j.applications} {j.applications === 1 ? "Application" : "Applications"}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete "${toDelete?.title ?? ""}"?`}
        description={`This permanently deletes the job and its ${toDelete?._count.applications ?? 0} application(s), including uploaded CVs. This cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent size="xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Job" : "New Job"}</DialogTitle>
            <DialogDescription>Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <DialogForm id="job-form" onSubmit={submit} noValidate>
            <DialogBody>
              {error && <p className="pf-alert pf-alert--error" role="alert">{error}</p>}

              <div className="pf-grid-2">
                <Field label="Department *" id="j-dept">
                  <Input id="j-dept" className="pf-input" value={form.department} maxLength={120} disabled={busy} onChange={(e) => set("department", e.target.value)} />
                </Field>
                <Field label="Employment Type" id="j-emp">
                  <Select value={form.employmentType} onValueChange={(v) => set("employmentType", v as EmploymentType)} disabled={busy}>
                    <SelectTrigger id="j-emp"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(EMPLOYMENT_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Workplace Type" id="j-wp">
                  <Select value={form.workplaceType} onValueChange={(v) => set("workplaceType", v as WorkplaceType)} disabled={busy}>
                    <SelectTrigger id="j-wp"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(WORKPLACE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Location *" id="j-loc">
                  <Input id="j-loc" className="pf-input" value={form.location} maxLength={200} disabled={busy} onChange={(e) => set("location", e.target.value)} />
                </Field>
                <Field label="Number of Vacancies" id="j-vac">
                  <Input id="j-vac" type="number" min={1} className="pf-input" value={form.vacancies} disabled={busy} onChange={(e) => set("vacancies", e.target.value)} />
                </Field>
                <Field label="Salary Range (optional)" id="j-sal">
                  <Input id="j-sal" className="pf-input" placeholder="e.g. 1500–2500 AZN" value={form.salaryRange} maxLength={120} disabled={busy} onChange={(e) => set("salaryRange", e.target.value)} />
                </Field>
                <Field label="Posted Date" id="j-posted">
                  <DatePicker id="j-posted" value={form.postedAt} disabled={busy} onChange={(v) => set("postedAt", v)} />
                </Field>
                <Field label="Application Expiry Date *" id="j-exp-date">
                  <DatePicker id="j-exp-date" value={form.expiresAt} min={form.postedAt || undefined} placeholder="Select deadline" disabled={busy} onChange={(v) => set("expiresAt", v)} />
                </Field>
                <Field label="Job Status" id="j-status">
                  <Select value={form.status === "EXPIRED" ? "DRAFT" : form.status} onValueChange={(v) => set("status", v as JobStatus)} disabled={busy}>
                    <SelectTrigger id="j-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="pf-hint">Jobs become Expired automatically after the expiry date.</span>
                </Field>
              </div>

              <div className="pf-lang-tabs" style={{ marginTop: 18 }} role="tablist">
                {JOB_LANGS.map((l) => {
                  const filled = !!form.tr[l].title.trim();
                  return (
                    <button
                      key={l}
                      type="button"
                      role="tab"
                      aria-selected={activeLang === l}
                      className={`pf-lang-tab${activeLang === l ? " is-active" : ""}`}
                      onClick={() => setActiveLang(l)}
                    >
                      {LANG_NAME[l]}
                      {l === "EN" ? " *" : ""}
                      {filled && <span className="job-tab-dot" aria-label="has content" />}
                    </button>
                  );
                })}
              </div>

              {JOB_LANGS.map((l) => {
                const f = form.tr[l];
                return (
                  <div key={l} role="tabpanel" hidden={activeLang !== l} style={{ marginTop: 14 }}>
                    <div className="pf-grid-2">
                      <Field label={`Job Title (${l}) ${l === "EN" ? "*" : ""}`} id={`j-title-${l}`}>
                        <Input id={`j-title-${l}`} className="pf-input" value={f.title} maxLength={200} disabled={busy} onChange={(e) => setTr(l, "title", e.target.value)} />
                      </Field>
                      <Field label={`Experience Level (${l})`} id={`j-exp-${l}`}>
                        <Input id={`j-exp-${l}`} className="pf-input" placeholder="e.g. 2–4 years" value={f.experienceLevel} maxLength={120} disabled={busy} onChange={(e) => setTr(l, "experienceLevel", e.target.value)} />
                      </Field>
                    </div>
                    <Field label={`Short Description (${l})`} id={`j-short-${l}`} mt>
                      <textarea id={`j-short-${l}`} rows={2} maxLength={300} className="pf-textarea" value={f.shortDescription} disabled={busy} onChange={(e) => setTr(l, "shortDescription", e.target.value)} placeholder="Shown on the job card. Leave empty to use the start of the full description." />
                    </Field>
                    <Field label={`Full Job Description (${l}) ${l === "EN" ? "*" : ""}`} id={`j-desc-${l}`} mt>
                      <RichTextEditor id={`j-desc-${l}`} value={f.description} onChange={(v) => setTr(l, "description", v)} disabled={busy} />
                    </Field>
                    <Field label={`Responsibilities (${l})`} id={`j-resp-${l}`} mt>
                      <RichTextEditor id={`j-resp-${l}`} value={f.responsibilities} onChange={(v) => setTr(l, "responsibilities", v)} disabled={busy} />
                    </Field>
                    <Field label={`Requirements and Qualifications (${l}) ${l === "EN" ? "*" : ""}`} id={`j-req-${l}`} mt>
                      <RichTextEditor id={`j-req-${l}`} value={f.requirements} onChange={(v) => setTr(l, "requirements", v)} disabled={busy} />
                    </Field>
                    <Field label={`Required Skills (${l})`} id={`j-skills-${l}`} mt>
                      <Input id={`j-skills-${l}`} className="pf-input" placeholder="React, TypeScript, Git" value={f.requiredSkills} disabled={busy} onChange={(e) => setTr(l, "requiredSkills", e.target.value)} />
                      <span className="pf-hint">Comma-separated.</span>
                    </Field>
                    <Field label={`Education Requirements (${l})`} id={`j-edu-${l}`} mt>
                      <RichTextEditor id={`j-edu-${l}`} value={f.educationRequirements} onChange={(v) => setTr(l, "educationRequirements", v)} disabled={busy} minHeight={90} />
                    </Field>
                  </div>
                );
              })}
              <p className="pf-hint" style={{ marginTop: 12 }}>
                English is required and is shown when a visitor's language has no translation. Saving
                only updates the languages that have a title; other languages are never overwritten.
              </p>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="job-form" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save Changes" : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, id, children, mt }: { label: string; id: string; children: React.ReactNode; mt?: boolean }) {
  return (
    <div className="pf-field" style={mt ? { marginTop: 16 } : undefined}>
      <label htmlFor={id} className="pf-label">
        {label}
      </label>
      {children}
    </div>
  );
}
