"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetApiKeysQuery,
  useGetApiLogsQuery,
  type ApiLogsQuery,
} from "@/redux/fetchers/apiKey/apiKeyApi";
import { fmtDate } from "./ApiKeysPanel";

const METHODS = ["GET", "POST", "PATCH", "DELETE"] as const;

export default function ApiLogsPanel() {
  const [page, setPage] = useState(1);
  const [apiKeyId, setApiKeyId] = useState("");
  const [method, setMethod] = useState("");
  const [outcome, setOutcome] = useState("");

  const query: ApiLogsQuery = {
    page,
    limit: 25,
    ...(apiKeyId ? { apiKeyId: Number(apiKeyId) } : {}),
    ...(method ? { method } : {}),
    ...(outcome ? { outcome: outcome as "success" | "failure" } : {}),
  };
  const { data, isFetching, isError, refetch } = useGetApiLogsQuery(query);
  const { data: keys } = useGetApiKeysQuery();
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <div className="settings-card dev-card">
      <div className="dev-card__head">
        <div>
          <h2 className="settings-card__title">Request logs</h2>
          <p className="settings-card__note dev-card__note">
            One row per external API request. Request bodies, query strings and keys are never stored.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={15} className={isFetching ? "dev-spin" : undefined} /> Refresh
        </Button>
      </div>

      <div className="dev-filters">
        <select className="form-input" value={apiKeyId} onChange={(e) => resetPage(setApiKeyId)(e.target.value)} aria-label="Filter by key">
          <option value="">All keys</option>
          {keys?.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <select className="form-input" value={method} onChange={(e) => resetPage(setMethod)(e.target.value)} aria-label="Filter by method">
          <option value="">All methods</option>
          {METHODS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select className="form-input" value={outcome} onChange={(e) => resetPage(setOutcome)(e.target.value)} aria-label="Filter by result">
          <option value="">Success &amp; failure</option>
          <option value="success">Success only</option>
          <option value="failure">Failures only</option>
        </select>
      </div>

      {isError ? (
        <p className="pf-alert pf-alert--error">Could not load logs.</p>
      ) : !data?.items.length ? (
        <div className="dev-empty">
          <p>{isFetching ? "Loading…" : "No requests recorded yet."}</p>
        </div>
      ) : (
        <>
          <div className="dash-table-wrap">
            <table className="dash-table dev-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Key</th>
                  <th>Request</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>IP</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l.id}>
                    <td className="dev-nowrap">{fmtDate(l.createdAt)}</td>
                    <td>{l.keyName ?? <span className="dev-sub">unknown or deleted key</span>}</td>
                    <td>
                      <span className={`dev-method dev-method--${l.method.toLowerCase()}`}>{l.method}</span>{" "}
                      <code className="dash-code">{l.path.replace(/^\/api\/v1/, "")}</code>
                    </td>
                    <td>
                      <span className={`dev-http ${l.success ? "dev-http--ok" : "dev-http--err"}`}>{l.statusCode}</span>
                    </td>
                    <td>{l.durationMs} ms</td>
                    <td>{l.ip ?? "—"}</td>
                    <td className="dev-err" title={l.errorMessage ?? undefined}>
                      {l.errorCode ? <code className="dash-code">{l.errorCode}</code> : null}
                      {l.errorMessage && <div className="dev-sub">{l.errorMessage}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dev-pager">
            <span className="dev-sub">
              {data.meta.total} request{data.meta.total === 1 ? "" : "s"} · page {data.meta.page} of {data.meta.totalPages}
            </span>
            <div className="dev-actions">
              <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
