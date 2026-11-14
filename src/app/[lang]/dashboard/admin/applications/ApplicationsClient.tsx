"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileText, Mail, Phone, Briefcase } from "lucide-react";
import {
  useGetApplicationsQuery,
  useGetJobsQuery,
  useUpdateApplicationStatusMutation,
  useResendApplicationEmailMutation,
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type JobApplication,
} from "@/redux/fetchers/job/jobApi";
import Pagination from "@/components/dashboard/Pagination";
import SkeletonTableRows from "@/components/dashboard/SkeletonTableRows";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const size = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export default function ApplicationsClient({ lang: _lang }: { lang: string }) {
  const params = useSearchParams();
  const initialJob = Number(params.get("jobId")) || "";

  const [jobId, setJobId] = useState<number | "">(initialJob);
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetApplicationsQuery({ jobId, status, search, from, to, page, limit });
  const { data: jobsData } = useGetJobsQuery({ limit: 100 });
  const [updateStatus, { isLoading: saving }] = useUpdateApplicationStatusMutation();
  const [resend, { isLoading: resending }] = useResendApplicationEmailMutation();

  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [msg, setMsg] = useState("");

  const apps = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const reset = () => setPage(1);

  async function changeStatus(a: JobApplication, s: ApplicationStatus) {
    setMsg("");
    try {
      const updated = await updateStatus({ id: a.id, status: s }).unwrap();
      setSelected((cur) => (cur && cur.id === a.id ? { ...cur, status: updated.status } : cur));
    } catch {
      setMsg("Could not update status.");
    }
  }

  async function retryEmail(a: JobApplication) {
    setMsg("");
    try {
      const updated = await resend(a.id).unwrap();
      setSelected((cur) => (cur && cur.id === a.id ? updated : cur));
      setMsg(updated.emailStatus === "SENT" ? "Email sent to HR." : `Email still failing: ${updated.emailError ?? "unknown error"}`);
    } catch {
      setMsg("Email retry failed.");
    }
  }

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Applications</h1>
          <p className="dash-page-sub">
            {isLoading ? "Loading…" : `${total} application${total === 1 ? "" : "s"} found`}
          </p>
        </div>
      </div>

      <div className="dash-toolbar">
        <input
          className="dash-search"
          placeholder="Search name, email or phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            reset();
          }}
        />
        <Select
          value={jobId === "" ? "__all__" : String(jobId)}
          onValueChange={(v) => {
            setJobId(v === "__all__" ? "" : Number(v));
            reset();
          }}
        >
          <SelectTrigger aria-label="Filter by job"><SelectValue placeholder="All jobs" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All jobs</SelectItem>
            {(jobsData?.data ?? []).map((j) => (
              <SelectItem key={j.id} value={String(j.id)}>
                {j.title} ({j._count.applications})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status === "" ? "__all__" : status}
          onValueChange={(v) => {
            setStatus(v === "__all__" ? "" : (v as ApplicationStatus));
            reset();
          }}
        >
          <SelectTrigger aria-label="Filter by status"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {APPLICATION_STATUSES.map((st) => (
              <SelectItem key={st} value={st}>{cap(st)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePicker value={from} max={to || undefined} placeholder="From date" clearable aria-label="From date" onChange={(v) => { setFrom(v); reset(); }} />
        <DatePicker value={to} min={from || undefined} placeholder="To date" clearable aria-label="To date" onChange={(v) => { setTo(v); reset(); }} />
      </div>

      {msg && <p className="notice notice--ok mb-3">{msg}</p>}

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Job</th>
              <th>Applied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonTableRows columns={["text", "text", "text", "badge", "badge"]} />
            ) : isError ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--red)" }}>
                  Failed to load applications.
                </td>
              </tr>
            ) : apps.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="dash-empty">
                    <FileText size={34} style={{ opacity: 0.3 }} />
                    <p>No applications match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              apps.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.fullName}</strong>
                    <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                      {a.email} · {a.phone}
                    </div>
                  </td>
                  <td>{a.job.title}</td>
                  <td>{new Date(a.appliedAt).toLocaleString()}</td>
                  <td>
                    <Select value={a.status} disabled={saving} onValueChange={(v) => changeStatus(a, v as ApplicationStatus)}>
                      <SelectTrigger aria-label={`Status for ${a.fullName}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>{cap(st)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <Button type="button" variant="outline" size="sm" onClick={() => setSelected(a)}>
                        View
                      </Button>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a href={`/api/job-applications/${a.id}/cv`} aria-label={`Download CV of ${a.fullName}`}>
                          <Download size={14} /> CV
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent size="wide">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.fullName}</DialogTitle>
                <DialogDescription>
                  Applied for {selected.job.title} on {new Date(selected.appliedAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <dl className="job-detail-grid">
                  <div><dt><Mail size={13} /> Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                  <div><dt><Phone size={13} /> Phone</dt><dd>{selected.phone}</dd></div>
                  <div><dt><Briefcase size={13} /> Job</dt><dd>{selected.job.title} · {selected.job.department}</dd></div>
                  <div><dt><FileText size={13} /> CV</dt><dd>{selected.cvOriginalName} ({size(selected.cvSize)})</dd></div>
                </dl>
                <div className="pf-field" style={{ marginTop: 14 }}>
                  <label className="pf-label" htmlFor="app-status">Status</label>
                  <Select value={selected.status} disabled={saving} onValueChange={(v) => changeStatus(selected, v as ApplicationStatus)}>
                    <SelectTrigger id="app-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>{cap(st)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <h4 style={{ margin: "16px 0 6px", fontSize: ".85rem" }}>Message</h4>
                <p style={{ whiteSpace: "pre-wrap", color: "var(--muted)", fontSize: ".9rem" }}>
                  {selected.message || "No message provided."}
                </p>
              </DialogBody>
              <DialogFooter>
                {selected.emailStatus !== "SENT" && (
                  <Button type="button" variant="outline" disabled={resending} onClick={() => retryEmail(selected)}>
                    {resending ? "Sending…" : "Retry email"}
                  </Button>
                )}
                <Button type="button" asChild>
                  <a href={`/api/job-applications/${selected.id}/cv`}>
                    <Download size={14} /> Download CV
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
