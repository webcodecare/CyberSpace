"use client";

import { useState, type FormEvent } from "react";
import type { Dict } from "@/lib/i18n";
import { useChangePasswordMutation } from "@/redux/fetchers/auth/authApi";

export default function ChangePasswordForm({ t }: { t: Dict }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [changePassword, { isLoading: loading }] = useChangePasswordMutation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!oldPw || !newPw || !confirmPw) { setError(t.dash.errPwRequired); return; }
    if (newPw.length < 6) { setError(t.dash.errPwLen); return; }
    if (newPw !== confirmPw) { setError(t.dash.errPwMatch); return; }
    try {
      await changePassword({ old_password: oldPw, new_password: newPw }).unwrap();
      setSuccess(true);
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error;
      setError(msg ?? t.dash.errPwWrong);
    }
  }

  return (
    <div className="dash-form-card">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{t.dash.pwChanged}</div>}
        <div className="form-group">
          <label className="form-label" htmlFor="old-pw">{t.dash.oldPassword}</label>
          <div className="input-wrap">
            <input id="old-pw" type={showPw ? "text" : "password"} className="form-input form-input--pw"
              value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" required />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? t.auth.hidePassword : t.auth.showPassword}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="new-pw">{t.dash.newPassword}</label>
          <input id="new-pw" type={showPw ? "text" : "password"} className="form-input"
            value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="confirm-pw">{t.dash.confirmNewPassword}</label>
          <input id="confirm-pw" type={showPw ? "text" : "password"} className="form-input"
            value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" required />
        </div>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? t.dash.saving : t.dash.save}
        </button>
      </form>
    </div>
  );
}
