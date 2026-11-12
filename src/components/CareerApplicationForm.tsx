"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSubmitCareerApplicationMutation } from "@/redux/fetchers/career/careerApi";
import type { Dict } from "@/lib/i18n";

const EMAIL_OK = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const PHONE_OK = (v: string) =>
  /^\+?[0-9\s()\-]{7,20}$/.test(v) && v.replace(/\D/g, "").length >= 7;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export default function CareerApplicationForm({ t }: { t: Dict }) {
  const c = t.careers;
  const searchParams = useSearchParams();
  const [submit, { isLoading, isSuccess, reset }] = useSubmitCareerApplicationMutation();

  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState(searchParams.get("position") ?? "");
  const [country, setCountry] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setErrors((prev) => ({ ...prev, resume: "" }));
    if (!file) {
      setResume(null);
      return;
    }
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setErrors((prev) => ({ ...prev, resume: c.errResumeType }));
      setResume(null);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setErrors((prev) => ({ ...prev, resume: c.errResumeSize }));
      setResume(null);
      e.target.value = "";
      return;
    }
    setResume(file);
  }

  function resetForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setPosition("");
    setCountry("");
    setLinkedinUrl("");
    setPortfolioUrl("");
    setYearsExperience("");
    setCoverLetter("");
    setResume(null);
    setConsent(false);
    setTrap("");
    setErrors({});
    setServerError("");
    if (fileRef.current) fileRef.current.value = "";
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2 || !email.trim() || !phone.trim() || !position.trim())
      next.required = c.errRequired;
    if (email.trim() && !EMAIL_OK(email.trim())) next.email = c.errEmail;
    if (phone.trim() && !PHONE_OK(phone.trim())) next.phone = c.errPhone;
    if (!resume) next.resume = c.errResumeType;
    if (!consent) next.consent = c.errConsent;
    if (trap) next.spam = c.errSpam;
    setErrors(next);
    if (Object.keys(next).length) return;

    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("positionApplied", position.trim());
    if (country.trim()) formData.append("country", country.trim());
    if (linkedinUrl.trim()) formData.append("linkedinUrl", linkedinUrl.trim());
    if (portfolioUrl.trim()) formData.append("portfolioUrl", portfolioUrl.trim());
    if (yearsExperience.trim()) formData.append("yearsExperience", yearsExperience.trim());
    if (coverLetter.trim()) formData.append("coverLetter", coverLetter.trim());
    formData.append("resume", resume as File);

    try {
      await submit(formData).unwrap();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const msg = (err as { data?: { message?: string } })?.data?.message;
      if (status === 409) setServerError(c.errDuplicate);
      else setServerError(msg ?? c.errGeneral);
    }
  }

  if (isSuccess) {
    return (
      <div className="career-apply-card apply-success">
        <div className="apply-success__icon">
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2>{c.successTitle}</h2>
        <p>{c.successMsg}</p>
        <button type="button" className="btn btn--outline" onClick={resetForm}>
          {c.applyAnother}
        </button>
      </div>
    );
  }

  const busy = isLoading;

  return (
    <form className="career-apply-card" onSubmit={handleSubmit} noValidate>
      <div className="career-apply-grid career-apply-grid--2">
        <div className="field">
          <label htmlFor="ca-name">{c.fullName} *</label>
          <input
            id="ca-name"
            value={fullName}
            maxLength={120}
            placeholder={c.fullNamePh}
            onChange={(e) => setFullName(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="field">
          <label htmlFor="ca-email">{c.email} *</label>
          <input
            id="ca-email"
            type="email"
            value={email}
            maxLength={160}
            placeholder={c.emailPh}
            aria-invalid={!!errors.email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
          {errors.email && <p className="err">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="ca-phone">{c.phone} *</label>
          <input
            id="ca-phone"
            type="tel"
            value={phone}
            maxLength={24}
            placeholder={c.phonePh}
            aria-invalid={!!errors.phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={busy}
          />
          {errors.phone && <p className="err">{errors.phone}</p>}
        </div>
        <div className="field">
          <label htmlFor="ca-position">{c.position} *</label>
          <input
            id="ca-position"
            value={position}
            maxLength={160}
            placeholder={c.positionPh}
            onChange={(e) => setPosition(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="field">
          <label htmlFor="ca-country">{c.country}</label>
          <input
            id="ca-country"
            value={country}
            maxLength={80}
            placeholder={c.countryPh}
            onChange={(e) => setCountry(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="field">
          <label htmlFor="ca-years">{c.experience}</label>
          <input
            id="ca-years"
            type="number"
            min={0}
            max={60}
            value={yearsExperience}
            placeholder={c.experiencePh}
            onChange={(e) => setYearsExperience(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="field">
          <label htmlFor="ca-linkedin">{c.linkedin}</label>
          <input
            id="ca-linkedin"
            type="url"
            value={linkedinUrl}
            placeholder={c.linkedinPh}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="field">
          <label htmlFor="ca-portfolio">{c.portfolio}</label>
          <input
            id="ca-portfolio"
            type="url"
            value={portfolioUrl}
            placeholder={c.portfolioPh}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            disabled={busy}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="ca-cover">{c.coverLetter}</label>
        <textarea
          id="ca-cover"
          rows={4}
          maxLength={2000}
          value={coverLetter}
          placeholder={c.coverLetterPh}
          onChange={(e) => setCoverLetter(e.target.value)}
          disabled={busy}
        />
      </div>

      <div className="resume-field">
        <label htmlFor="ca-resume">{c.resume} *</label>
        <label className="resume-drop" htmlFor="ca-resume">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, color: "var(--blue)" }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="resume-drop__name">{resume ? resume.name : c.resumeChoose}</span>
          <span className="resume-drop__hint">{c.resumeHint}</span>
        </label>
        <input
          id="ca-resume"
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleFile}
          disabled={busy}
          style={{ display: "none" }}
        />
        {errors.resume && <p className="err">{errors.resume}</p>}
      </div>

      {/* Honeypot: hidden from people, filled in by simple bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="ca-site">Website</label>
        <input
          id="ca-site"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <label className="check check--box">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={busy}
        />
        <span>{c.privacyConsent}</span>
      </label>
      {errors.consent && <p className="err">{errors.consent}</p>}
      {errors.required && <p className="err">{errors.required}</p>}
      {errors.spam && <p className="err">{errors.spam}</p>}
      {serverError && (
        <p className="err" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        className="btn btn--primary btn--block"
        disabled={busy}
        style={{ marginTop: 10 }}
      >
        {busy ? c.submitting : c.submit}
      </button>
    </form>
  );
}
