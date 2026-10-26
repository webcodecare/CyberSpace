"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import {
  useGetInquiriesQuery,
  useUpdateInquiryMutation,
  type Inquiry,
} from "@/redux/fetchers/inquiry/inquiryApi";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody,
} from "@/components/ui/dialog";
import { MessageSquare, User, Phone, Package, Calendar, X } from "lucide-react";

const STATUSES = ["ALL", "NEW", "IN_PROGRESS", "DONE"];

function getProductName(inq: Inquiry, lang: string) {
  const trans = inq.product?.translations?.find((x) => x.lang === lang.toUpperCase());
  return trans?.name ?? "—";
}

function statusLabel(s: string, t: Dict) {
  if (s === "NEW") return t.dash.statusNew;
  if (s === "IN_PROGRESS") return t.dash.statusInProgress;
  return t.dash.statusDone;
}

function statusClass(s: string) {
  if (s === "NEW") return "status-badge--new";
  if (s === "IN_PROGRESS") return "status-badge--in-progress";
  return "status-badge--done";
}

export default function InquiriesClient({ lang, t }: { lang: string; t: Dict }) {
  const { data: inquiries = [], isLoading } = useGetInquiriesQuery();
  const [updateInquiry, { isLoading: updating }] = useUpdateInquiryMutation();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const filtered = inquiries.filter((i) => {
    if (filter !== "ALL" && i.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.phone.includes(q) || getProductName(i, lang).toLowerCase().includes(q);
    }
    return true;
  });

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id);
    try {
      await updateInquiry({ id, status }).unwrap();
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.inquiries}</h1>
          <p className="dash-page-sub">Review and update the status of customer inquiries.</p>
        </div>
      </div>
      <div className="dash-toolbar">
        <input
          type="text" className="dash-search" placeholder={t.dash.search}
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <div className="dash-filters">
          {STATUSES.map((s) => (
            <button key={s} type="button"
              className={`dash-filter-btn${filter === s ? " is-active" : ""}`}
              onClick={() => setFilter(s)}>
              {s === "ALL" ? t.dash.filterAll : statusLabel(s, t)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>#</th><th>{t.dash.product}</th><th>{t.dash.customer}</th><th>{t.dash.phone}</th><th>{t.dash.date}</th><th>{t.dash.status}</th><th></th></tr></thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><span className="skel skel--sm" style={{ width: 24 }} /></td>
                  <td><span className="skel skel--md" /></td>
                  <td><span className="skel skel--md" /></td>
                  <td><span className="skel skel--sm" /></td>
                  <td><span className="skel skel--sm" /></td>
                  <td><span className="skel skel--badge" /></td>
                  <td><span className="skel skel--badge" style={{ width: 32 }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.3 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>{t.dash.noData}</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.dash.product}</th>
                <th>{t.dash.customer}</th>
                <th>{t.dash.phone}</th>
                <th>{t.dash.date}</th>
                <th>{t.dash.status}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inq) => (
                <tr key={inq.id} style={{ cursor: "pointer" }} onClick={() => setSelected(inq)}>
                  <td className="dash-table__id">{inq.id}</td>
                  <td><span className="dash-name">{getProductName(inq, lang)}</span></td>
                  <td>{inq.name}</td>
                  <td>{inq.phone}</td>
                  <td>{formatDate(inq.createdAt, lang as Locale)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`status-select status-select--${inq.status.toLowerCase().replace("_", "-")}`}
                      value={inq.status}
                      disabled={updatingId === inq.id || updating}
                      onChange={(e) => updateStatus(inq.id, e.target.value)}
                    >
                      <option value="NEW">{t.dash.statusNew}</option>
                      <option value="IN_PROGRESS">{t.dash.statusInProgress}</option>
                      <option value="DONE">{t.dash.statusDone}</option>
                    </select>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <button
                        type="button"
                        className="inq-view-btn"
                        title="View details"
                        onClick={(e) => { e.stopPropagation(); setSelected(inq); }}
                      >
                        <MessageSquare size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent size="default">
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #1457d9 0%, #2f6bff 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(20,87,217,0.3)",
              }}>
                <MessageSquare size={16} color="#fff" />
              </div>
              <div>
                <DialogTitle>Inquiry #{selected?.id}</DialogTitle>
                <p style={{ margin: 0, fontSize: ".8rem", color: "var(--muted)" }}>
                  {selected && formatDate(selected.createdAt, lang as Locale)}
                </p>
              </div>
            </div>
          </DialogHeader>

          <DialogBody>
            {selected && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Status badge + update */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <span className={`status-badge ${statusClass(selected.status)}`} style={{ fontSize: ".82rem", padding: "4px 12px" }}>
                    {statusLabel(selected.status, t)}
                  </span>
                  <select
                    className={`status-select status-select--${selected.status.toLowerCase().replace("_", "-")}`}
                    value={selected.status}
                    disabled={updatingId === selected.id || updating}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    style={{ fontSize: ".82rem" }}
                  >
                    <option value="NEW">{t.dash.statusNew}</option>
                    <option value="IN_PROGRESS">{t.dash.statusInProgress}</option>
                    <option value="DONE">{t.dash.statusDone}</option>
                  </select>
                </div>

                <div style={{ height: 1, background: "var(--border)" }} />

                {/* Info rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="inq-detail-row">
                    <span className="inq-detail-icon"><User size={14} /></span>
                    <div>
                      <p className="inq-detail-label">Customer</p>
                      <p className="inq-detail-value">{selected.name}</p>
                    </div>
                  </div>
                  <div className="inq-detail-row">
                    <span className="inq-detail-icon"><Phone size={14} /></span>
                    <div>
                      <p className="inq-detail-label">Phone</p>
                      <a href={`tel:${selected.phone}`} className="inq-detail-value inq-detail-value--link">{selected.phone}</a>
                    </div>
                  </div>
                  <div className="inq-detail-row">
                    <span className="inq-detail-icon"><Package size={14} /></span>
                    <div>
                      <p className="inq-detail-label">Product</p>
                      <p className="inq-detail-value">{getProductName(selected, lang)}</p>
                    </div>
                  </div>
                  {selected.submittedBy && (
                    <div className="inq-detail-row">
                      <span className="inq-detail-icon"><Calendar size={14} /></span>
                      <div>
                        <p className="inq-detail-label">Submitted by</p>
                        <p className="inq-detail-value">{selected.submittedBy.name ?? selected.submittedBy.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                {selected.message && (
                  <>
                    <div style={{ height: 1, background: "var(--border)" }} />
                    <div>
                      <p className="inq-detail-label" style={{ marginBottom: 8 }}>Message</p>
                      <div className="inq-message-box">{selected.message}</div>
                    </div>
                  </>
                )}

                {!selected.message && (
                  <p style={{ color: "var(--muted)", fontSize: ".85rem", fontStyle: "italic" }}>No message provided.</p>
                )}
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
