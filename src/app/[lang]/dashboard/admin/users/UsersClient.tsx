"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogForm,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateAdminMutation,
  type ApiUser,
} from "@/redux/fetchers/user/userApi";

export default function UsersClient({
  lang,
  t,
  currentUserId,
}: {
  lang: string;
  t: Dict;
  currentUserId: number;
}) {
  const { data: users = [], isLoading } = useGetAllUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [createAdmin, { isLoading: creating }] = useCreateAdminMutation();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [createError, setCreateError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  async function updateRole(id: number, role: string) {
    setUpdatingId(id);
    try {
      await updateUser({ id, role }).unwrap();
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleActive(id: number, isActive: boolean) {
    setUpdatingId(id);
    try {
      await updateUser({ id, isActive }).unwrap();
    } finally {
      setUpdatingId(null);
    }
  }

  function promptDelete(id: number) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await deleteUser(pendingDeleteId).unwrap();
      setConfirmOpen(false);
      setPendingDeleteId(null);
    } catch {
      setConfirmOpen(false);
    }
  }

  async function createAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setCreateError(t.dash.errPwRequired);
      return;
    }
    try {
      await createAdmin(form).unwrap();
      setOpen(false);
      setForm({ name: "", email: "", password: "" });
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error;
      setCreateError(msg ?? "Failed to create admin");
    }
  }

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.users}</h1>
          <p className="dash-page-sub">Manage user accounts, roles, and access.</p>
        </div>
        <Button type="button" size="sm" onClick={() => { setCreateError(""); setOpen(true); }} style={{ flexShrink: 0 }}>
          + {t.dash.createAdmin}
        </Button>
      </div>
      <div className="dash-toolbar">
        <Input
          type="text"
          className="dash-search"
          placeholder={t.dash.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {isLoading ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>{t.dash.name}</th><th>{t.dash.email}</th><th>{t.dash.role}</th><th>{t.dash.active}</th><th>{t.dash.date}</th><th>{t.dash.actions}</th></tr></thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><span className="skel skel--md" /></td>
                  <td><span className="skel skel--md" /></td>
                  <td><span className="skel skel--badge" /></td>
                  <td><span className="skel skel--badge" /></td>
                  <td><span className="skel skel--sm" /></td>
                  <td><span className="skel skel--badge" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.3 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p>{t.dash.noData}</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t.dash.name}</th>
                <th>{t.dash.email}</th>
                <th>{t.dash.role}</th>
                <th>{t.dash.active}</th>
                <th>{t.dash.date}</th>
                <th>{t.dash.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: ApiUser) => (
                <tr key={u.id}>
                  <td>{u.name ?? "—"}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.id === currentUserId ? (
                      <span className="dash-pill dash-pill--blue">{u.role}</span>
                    ) : (
                      <select
                        className="role-select"
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="SALES">SALES</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`toggle-switch${u.isActive ? " toggle-switch--on" : ""}`}
                      disabled={updatingId === u.id || u.id === currentUserId}
                      onClick={() => toggleActive(u.id, !u.isActive)}
                      aria-pressed={u.isActive}
                      aria-label={u.isActive ? "Deactivate user" : "Activate user"}
                    >
                      <span className="toggle-switch__knob" />
                    </button>
                  </td>
                  <td>{formatDate(u.createdAt, lang as Locale)}</td>
                  <td>
                    {u.id !== currentUserId && (
                      <Button
                        type="button" variant="destructive" size="sm"
                        disabled={updatingId === u.id || deleting}
                        onClick={() => promptDelete(u.id)}
                      >
                        ✕
                      </Button>
                    )}
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
        title="Delete this user?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--blue"><Users size={20} strokeWidth={2} color="#fff" /></div>
              <div>
                <DialogTitle>{t.dash.createAdmin}</DialogTitle>
                <DialogDescription>New admin account. Password min 6 characters.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogForm id="create-admin-form" onSubmit={createAdminSubmit} noValidate>
            <DialogBody>
              {createError && <div className="auth-error mb-3">{createError}</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="pf-field">
                  <label htmlFor="ua-name" className="pf-label">{t.dash.name}</label>
                  <Input id="ua-name" type="text" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required className="pf-input" />
                </div>
                <div className="pf-field">
                  <label htmlFor="ua-email" className="pf-label">{t.dash.email}</label>
                  <Input id="ua-email" type="email" value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required className="pf-input" />
                </div>
                <div className="pf-field">
                  <label htmlFor="ua-password" className="pf-label">{t.auth.password}</label>
                  <Input id="ua-password" type="password" value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required className="pf-input" />
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" form="create-admin-form" disabled={creating}>
                {creating ? t.dash.saving : t.dash.createAdmin}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
