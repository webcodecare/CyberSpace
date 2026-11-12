"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { useLoginMutation } from "@/redux/fetchers/auth/authApi";

export default function LoginForm({ lang }: { lang: string }) {
  const router = useRouter();
  const t = isLocale(lang) ? getDict(lang) : getDict("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [clientError, setClientError] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setClientError("");
    if (!email.trim() || !password) {
      setClientError(t.auth.errRequired);
      return;
    }
    try {
      await login({ email: email.trim(), password }).unwrap();
      router.push(`/${lang}/dashboard`);
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error;
      setClientError(msg ?? t.auth.errLogin);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {clientError && (
        <div className="auth-error" role="alert">
          {clientError}
        </div>
      )}
      <div className="form-group">
        <label className="form-label" htmlFor="email">
          {t.auth.email}
        </label>
        <input
          id="email"
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="password">
          {t.auth.password}
        </label>
        <div className="input-wrap">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            className="form-input form-input--pw"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? t.auth.hidePassword : t.auth.showPassword}
          >
            {showPw ? (
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="m1 1 22 22" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={isLoading}>
        {isLoading ? t.auth.loggingIn : t.auth.login}
      </button>
    </form>
  );
}
