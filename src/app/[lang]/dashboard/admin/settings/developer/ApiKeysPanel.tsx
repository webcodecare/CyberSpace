"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Copy, KeyRound, Pencil, Plus, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogForm,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import {
  apiErrorMessage,
  useCreateApiKeyMutation,
  useDeleteApiKeyMutation,
  useGetApiKeysQuery,
  useGetApiMetaQuery,
  useLazyRevealApiKeyQuery,
  useRevokeApiKeyMutation,
  useUpdateApiKeyMutation,
  type ApiKeyRow,
  type ApiKeyStatus,
  type ApiPermissionDef,
  type CreatedApiKey,
} from "@/redux/fetchers/apiKey/apiKeyApi";
import { CopyButton, copyText } from "./CodeBlock";

export const fmtDate = (iso: string | null, withTime = true) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";

export function StatusBadge({ status }: { status: ApiKeyStatus }) {
  const label = status === "ACTIVE" ? "Active" : status === "REVOKED" ? "Revoked" : "Expired";
  return <span className={`dev-status dev-status--${status.toLowerCase()}`}>{label}</span>;
}

type ExpiryChoice = "never" | "30" | "90" | "365" | "custom";

interface FormState {
  name: string;
  permissions: string[];
  ips: string;
  expiry: ExpiryChoice;
  customDate: string; // yyyy-mm-dd
}

const emptyForm: FormState = { name: "", permissions: [], ips: "", expiry: "never", customDate: "" };

const toIsoEndOfDay = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T23:59:59`).toISOString();

function expiryToIso(f: FormState): string | null {
  if (f.expiry === "never") return null;
  if (f.expiry === "custom") return f.customDate ? toIsoEndOfDay(f.customDate) : null;
  return new Date(Date.now() + Number(f.expiry) * 86_400_000).toISOString();
}

const parseIps = (raw: string) =>
  Array.from(new Set(raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)));

function PermissionPicker({
  defs,
  value,
  onChange,
}: {
  defs: ApiPermissionDef[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const groups = useMemo(() => {
    const m = new Map<string, ApiPermissionDef[]>();
    for (const d of defs) m.set(d.group, [...(m.get(d.group) ?? []), d]);
    return [...m.entries()];
  }, [defs]);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div className="dev-perms">
      {groups.map(([group, items]) => {
        const all = items.every((i) => value.includes(i.id));
        return (
          <fieldset key={group} className="dev-perms__group">
            <legend className="dev-perms__legend">
              {group}
              <button
                type="button"
                className="dev-link"
                onClick={() =>
                  onChange(
                    all
                      ? value.filter((v) => !items.some((i) => i.id === v))
                      : Array.from(new Set([...value, ...items.map((i) => i.id)])),
                  )
                }
              >
                {all ? "Clear" : "Select all"}
              </button>
            </legend>
            {items.map((p) => (
              <label key={p.id} className="dev-perm">
                <input type="checkbox" checked={value.includes(p.id)} onChange={() => toggle(p.id)} />
                <span>
                  <code className="dev-perm__id">{p.id}</code>
                  <span className="dev-perm__desc">{p.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
        );
      })}
    </div>
  );
}

function KeyFormDialog({
  open,
  onOpenChange,
  editing,
  defs,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: ApiKeyRow | null;
  defs: ApiPermissionDef[];
}) {
  const [createKey, { isLoading: creating }] = useCreateApiKeyMutation();
  const [updateKey, { isLoading: updating }] = useUpdateApiKeyMutation();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [savedAck, setSavedAck] = useState(false);
  const [initFor, setInitFor] = useState<number | "new" | null>(null);

  // Re-seed the form each time the dialog opens (render-phase reset, no effect needed).
  const marker = open ? (editing?.id ?? "new") : null;
  if (marker !== initFor) {
    setInitFor(marker);
    if (open) {
      setError("");
      setCreated(null);
      setSavedAck(false);
      setForm(
        editing
          ? {
              name: editing.name,
              permissions: editing.permissions,
              ips: editing.allowedIps.join("\n"),
              expiry: editing.expiresAt ? "custom" : "never",
              customDate: editing.expiresAt ? editing.expiresAt.slice(0, 10) : "",
            }
          : emptyForm,
      );
    }
  }

  const busy = creating || updating;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Give the key a name (at least 2 characters).");
    if (form.permissions.length === 0) return setError("Select at least one permission.");
    if (form.expiry === "custom" && !form.customDate) return setError("Pick an expiration date or choose “Never”.");
    const expiresAt = expiryToIso(form);
    // When editing, keep an unchanged expiry exactly as stored.
    const keepExpiry = editing && form.expiry === "custom" && form.customDate === editing.expiresAt?.slice(0, 10);
    const body = {
      name: form.name.trim(),
      permissions: form.permissions,
      allowedIps: parseIps(form.ips),
      ...(keepExpiry ? {} : { expiresAt }),
    };
    try {
      if (editing) {
        await updateKey({ id: editing.id, body }).unwrap();
        toast.success("API key updated");
        onOpenChange(false);
      } else {
        setCreated(await createKey(body).unwrap());
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // Step 2 (create only): the one and only time the secret is visible.
  if (created) {
    return (
      <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : savedAck && onOpenChange(false))}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => !savedAck && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Copy your API key</DialogTitle>
            <DialogDescription>
              You can copy this key again later from the API keys list (copy icon) while it is active.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="dev-secret">
              <code className="dev-secret__value" data-testid="new-api-key">
                {created.secret}
              </code>
              <CopyButton text={created.secret} label="Copy key" />
            </div>
            <p className="dev-note dev-note--warn">
              <AlertTriangle size={15} /> Keep it server-side. Never put it in browser code, mobile apps or public repositories.
            </p>
            <label className="dev-check">
              <input type="checkbox" checked={savedAck} onChange={(e) => setSavedAck(e.target.checked)} />
              <span>I have copied this key and stored it somewhere safe.</span>
            </label>
          </DialogBody>
          <DialogFooter>
            <Button type="button" disabled={!savedAck} onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit API key" : "Generate new API key"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Changes apply to the very next request. The secret itself cannot be changed."
              : "Grant only the permissions the integration really needs."}
          </DialogDescription>
        </DialogHeader>
        <DialogForm id="api-key-form" onSubmit={submit} noValidate>
          <DialogBody>
            {error && (
              <p className="pf-alert pf-alert--error" role="alert">
                {error}
              </p>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="ak-name">
                Key name
              </label>
              <Input
                id="ak-name"
                value={form.name}
                maxLength={80}
                placeholder="e.g. ERP product sync"
                onChange={(e) => set("name", e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <span className="form-label">Permissions</span>
              <PermissionPicker defs={defs} value={form.permissions} onChange={(v) => set("permissions", v)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ak-exp">
                Expiration
              </label>
              <div className="dev-row">
                <select
                  id="ak-exp"
                  className="form-input"
                  value={form.expiry}
                  onChange={(e) => set("expiry", e.target.value as ExpiryChoice)}
                >
                  <option value="never">Never expires</option>
                  <option value="30">In 30 days</option>
                  <option value="90">In 90 days</option>
                  <option value="365">In 1 year</option>
                  <option value="custom">Custom date…</option>
                </select>
                {form.expiry === "custom" && (
                  <input
                    type="date"
                    className="form-input"
                    value={form.customDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => set("customDate", e.target.value)}
                    aria-label="Expiration date"
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ak-ips">
                Allowed IP addresses <span className="dev-optional">(optional)</span>
              </label>
              <textarea
                id="ak-ips"
                className="form-input dev-textarea"
                rows={3}
                value={form.ips}
                placeholder={"203.0.113.10\n198.51.100.0/24"}
                onChange={(e) => set("ips", e.target.value)}
              />
              <p className="dev-hint">One IPv4/IPv6 address or CIDR range per line. Leave empty to allow any IP.</p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="api-key-form" disabled={busy}>
              {busy ? "Saving…" : editing ? "Save changes" : "Generate key"}
            </Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}

export default function ApiKeysPanel() {
  const { data: keys, isLoading, isError } = useGetApiKeysQuery();
  const { data: meta } = useGetApiMetaQuery();
  const [revokeKey, { isLoading: revoking }] = useRevokeApiKeyMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiKeyRow | null>(null);
  const [toRevoke, setToRevoke] = useState<ApiKeyRow | null>(null);
  const [revealKey] = useLazyRevealApiKeyQuery();
  const [deleteKey, { isLoading: deleting }] = useDeleteApiKeyMutation();
  const [toDelete, setToDelete] = useState<ApiKeyRow | null>(null);

  const defs = meta?.permissions ?? [];

  async function copyKey(k: ApiKeyRow) {
    try {
      const { secret } = await revealKey(k.id).unwrap();
      if (await copyText(secret)) toast.success("API key copied", k.name);
      else toast.error("Could not copy to clipboard");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function confirmRevoke() {
    if (!toRevoke) return;
    try {
      await revokeKey(toRevoke.id).unwrap();
      toast.success("API key revoked", "It stopped working immediately.");
      setToRevoke(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteKey(toDelete.id).unwrap();
      toast.success("API key deleted", toDelete.name);
      setToDelete(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="settings-card dev-card">
      <div className="dev-card__head">
        <div>
          <h2 className="settings-card__title">API keys</h2>
          <p className="settings-card__note dev-card__note">
            Keys authenticate external applications. Each key has its own permissions, expiry and optional IP allow-list, and can be revoked on its own.
          </p>
        </div>
        <Button
          type="button"
          disabled={!meta}
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus size={16} /> Generate new key
        </Button>
      </div>

      {isLoading ? (
        <span className="skel skel--md" style={{ width: "100%", height: 80 }} />
      ) : isError ? (
        <p className="pf-alert pf-alert--error">Could not load API keys.</p>
      ) : !keys?.length ? (
        <div className="dev-empty">
          <KeyRound size={28} />
          <p>No API keys yet. Generate one to let an external application use the Developer API.</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table dev-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Status</th>
                <th>Permissions</th>
                <th>Expires</th>
                <th>Last used</th>
                <th>24h</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className={k.status !== "ACTIVE" ? "dev-row--muted" : undefined}>
                  <td>
                    <strong>{k.name}</strong>
                    <div className="dev-sub">Created {fmtDate(k.createdAt, false)}</div>
                  </td>
                  <td>
                    <div className="dev-actions">
                      <code className="dash-code">{k.prefix}…</code>
                      {k.status !== "REVOKED" && (
                        <button
                          type="button"
                          className="dev-icon-btn"
                          title="Copy full key"
                          aria-label={`Copy ${k.name} key`}
                          style={k.canCopy ? undefined : { opacity: 0.5 }}
                          onClick={() => copyKey(k)}
                        >
                          <Copy size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={k.status} />
                    {k.revokedAt && <div className="dev-sub">{fmtDate(k.revokedAt, false)}</div>}
                  </td>
                  <td>
                    <div className="dev-chips" title={k.permissions.join(", ")}>
                      {k.permissions.slice(0, 3).map((p) => (
                        <span key={p} className="dev-chip">
                          {p}
                        </span>
                      ))}
                      {k.permissions.length > 3 && <span className="dev-chip dev-chip--more">+{k.permissions.length - 3}</span>}
                    </div>
                    {k.allowedIps.length > 0 && <div className="dev-sub">IP-restricted ({k.allowedIps.length})</div>}
                  </td>
                  <td>{k.expiresAt ? fmtDate(k.expiresAt, false) : "Never"}</td>
                  <td>
                    {fmtDate(k.lastUsedAt)}
                    {k.lastUsedIp && <div className="dev-sub">{k.lastUsedIp}</div>}
                  </td>
                  <td>{k.requests24h}</td>
                  <td>
                    <div className="dev-actions">
                      {k.status !== "REVOKED" && (
                        <>
                          <button
                            type="button"
                            className="dev-icon-btn"
                            title="Edit"
                            aria-label={`Edit ${k.name}`}
                            onClick={() => {
                              setEditing(k);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="dev-icon-btn dev-icon-btn--danger"
                            title="Revoke"
                            aria-label={`Revoke ${k.name}`}
                            onClick={() => setToRevoke(k)}
                          >
                            <ShieldOff size={15} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="dev-icon-btn dev-icon-btn--danger"
                        title="Delete"
                        aria-label={`Delete ${k.name}`}
                        onClick={() => setToDelete(k)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <KeyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} defs={defs} />

      <ConfirmDialog
        open={!!toRevoke}
        onOpenChange={(v) => !v && setToRevoke(null)}
        title={`Revoke “${toRevoke?.name ?? ""}”?`}
        description="Applications using this key will immediately receive 401 errors. This cannot be undone; generate a new key if needed. Other keys are not affected."
        confirmText="Revoke key"
        loading={revoking}
        onConfirm={confirmRevoke}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete “${toDelete?.name ?? ""}”?`}
        description="The key is permanently removed and any application using it will immediately receive 401 errors. This cannot be undone. Its request logs are kept, but no longer show the key name."
        confirmText="Delete key"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
