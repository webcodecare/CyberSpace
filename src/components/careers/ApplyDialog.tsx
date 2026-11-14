"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, X, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/useLang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogForm,
} from "@/components/ui/dialog";
import { pickTranslation, type PublicJob } from "./types";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT = /\.(pdf|doc|docx)$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d][\d\s()-]{5,24}$/;

type Errors = Partial<Record<"fullName" | "email" | "phone" | "cv", string>>;

export default function ApplyDialog({
  job,
  onClose,
}: {
  job: PublicJob | null;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const c = t.careers;
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  // Fresh form each time a (different) job is opened.
  useEffect(() => {
    if (job) {
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setFile(null);
      setErrors({});
      setServerError("");
      setSending(false);
      setDone(false);
    }
  }, [job?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(onClose, 2000);
    return () => clearTimeout(id);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(f: File | undefined) {
    if (!f) return;
    if (!EXT.test(f.name)) return setErrors((e) => ({ ...e, cv: c.badCv }));
    if (f.size > MAX_BYTES) return setErrors((e) => ({ ...e, cv: c.bigCv }));
    if (f.size === 0) return setErrors((e) => ({ ...e, cv: c.badCv }));
    setFile(f);
    setErrors((e) => ({ ...e, cv: undefined }));
  }

  function removeFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !job) return;
    const errs: Errors = {};
    if (fullName.trim().length < 2) errs.fullName = c.reqName;
    if (!EMAIL.test(email.trim())) errs.email = c.reqEmail;
    if (!PHONE.test(phone.trim())) errs.phone = c.reqPhone;
    if (!file) errs.cv = c.reqCv;
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length) return;

    const fd = new FormData();
    fd.set("jobId", String(job.id));
    fd.set("fullName", fullName.trim());
    fd.set("email", email.trim());
    fd.set("phone", phone.trim());
    if (message.trim()) fd.set("message", message.trim());
    fd.set("cv", file!);

    setSending(true);
    try {
      const res = await fetch("/api/job-applications", { method: "POST", body: fd });
      if (res.ok) {
        setDone(true);
        return;
      }
      const body = await res.json().catch(() => null);
      // Server messages are English; show localized text keyed by status instead.
      setServerError(
        res.status === 409
          ? c.errDuplicate
          : res.status === 410 || res.status === 404
            ? c.errClosed
            : res.status === 429
              ? c.errTooMany
              : res.status === 400 && /CV/i.test(body?.message ?? "")
                ? c.badCv
                : c.errGeneral,
      );
    } catch {
      setServerError(c.errGeneral);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={!!job} onOpenChange={(v) => !v && !sending && onClose()}>
      <DialogContent size="default">
        {job && (
          <DialogForm onSubmit={submit} noValidate aria-busy={sending}>
            <DialogHeader>
              <DialogTitle>
                {c.applyFor} {pickTranslation(job, lang).title}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              {done ? (
                <div className="apply-success" role="status">
                  <div className="apply-success__icon">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3>{c.success}</h3>
                </div>
              ) : (
                <>
                  {serverError && (
                    <p className="pf-alert pf-alert--error" role="alert">
                      {serverError}
                    </p>
                  )}
                  <div className="pf-field">
                    <label className="pf-label" htmlFor="ap-name">{c.fullName} *</label>
                    <Input id="ap-name" className="pf-input" value={fullName} maxLength={120} disabled={sending} autoComplete="name" aria-invalid={!!errors.fullName} onChange={(e) => setFullName(e.target.value)} />
                    {errors.fullName && <span className="pf-error">{errors.fullName}</span>}
                  </div>
                  <div className="pf-field" style={{ marginTop: 12 }}>
                    <label className="pf-label" htmlFor="ap-email">{c.email} *</label>
                    <Input id="ap-email" type="email" className="pf-input" value={email} maxLength={200} disabled={sending} autoComplete="email" aria-invalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
                    {errors.email && <span className="pf-error">{errors.email}</span>}
                  </div>
                  <div className="pf-field" style={{ marginTop: 12 }}>
                    <label className="pf-label" htmlFor="ap-phone">{c.phone} *</label>
                    <Input id="ap-phone" type="tel" className="pf-input" value={phone} maxLength={25} disabled={sending} autoComplete="tel" aria-invalid={!!errors.phone} onChange={(e) => setPhone(e.target.value)} />
                    {errors.phone && <span className="pf-error">{errors.phone}</span>}
                  </div>
                  <div className="pf-field" style={{ marginTop: 12 }}>
                    <span className="pf-label">{c.cv} *</span>
                    <input
                      ref={fileRef}
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => pick(e.target.files?.[0])}
                    />
                    {file ? (
                      <div className="cv-file">
                        <Paperclip size={15} />
                        <span className="cv-file__name" title={file.name}>{file.name}</span>
                        <button type="button" className="cv-file__btn" disabled={sending} onClick={() => fileRef.current?.click()}>{c.replace}</button>
                        <button type="button" className="cv-file__btn cv-file__btn--x" disabled={sending} aria-label={c.remove} onClick={removeFile}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" disabled={sending} onClick={() => fileRef.current?.click()}>
                        <Paperclip size={15} /> {c.chooseFile}
                      </Button>
                    )}
                    <span className="pf-hint">{c.cvHelp}</span>
                    {errors.cv && <span className="pf-error">{errors.cv}</span>}
                  </div>
                  <div className="pf-field" style={{ marginTop: 12 }}>
                    <label className="pf-label" htmlFor="ap-msg">{c.message}</label>
                    <textarea id="ap-msg" rows={3} maxLength={2000} className="pf-textarea" value={message} disabled={sending} onChange={(e) => setMessage(e.target.value)} />
                  </div>
                </>
              )}
            </DialogBody>
            {!done && (
              <DialogFooter>
                <Button type="button" variant="outline" disabled={sending} onClick={onClose}>
                  {c.cancel}
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending ? c.sending : c.submit}
                </Button>
              </DialogFooter>
            )}
          </DialogForm>
        )}
      </DialogContent>
    </Dialog>
  );
}
