"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, Clock, Users, Hourglass, Wallet } from "lucide-react";
import { useLang } from "@/lib/useLang";
import { formatDay } from "@/lib/format";
import { Button } from "@/components/ui/button";
import ApplyDialog from "./ApplyDialog";
import { isClosed, pickTranslation, type PublicJob } from "./types";
import { jobTypeLabel } from "./labels";

function Section({ title, html }: { title: string; html: string | null }) {
  if (!html) return null;
  // HTML is sanitized server-side (sanitize-html allow-list) before storage.
  return (
    <section className="job-section">
      <h2>{title}</h2>
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

export default function JobDetailView({ job }: { job: PublicJob }) {
  const { t, lang } = useLang();
  const c = t.careers;
  const [applying, setApplying] = useState(false);
  const j = { ...job, ...pickTranslation(job, lang) };
  const closed = isClosed(job);

  const applyBtn = closed ? (
    <span className="job-closed">{c.closed}</span>
  ) : (
    <Button type="button" size="lg" onClick={() => setApplying(true)}>
      {c.apply}
    </Button>
  );

  return (
    <>
      <Link href={`/${lang}/careers`} className="job-back">
        <ArrowLeft size={15} /> {c.title}
      </Link>

      <div className="job-page">
        <article className="job-page__main">
          <header className="job-page__head">
            <h1>{j.title}</h1>
            <div className="job-meta">
              <span className="job-chip job-chip--blue">{jobTypeLabel(c, job.employmentType)}</span>
              <span className="job-chip">{jobTypeLabel(c, job.workplaceType)}</span>
            </div>
          </header>
          <Section title={c.description} html={j.description} />
          <Section title={c.responsibilities} html={j.responsibilities} />
          <Section title={c.requirements} html={j.requirements} />
          {j.requiredSkills.length > 0 && (
            <section className="job-section">
              <h2>{c.skills}</h2>
              <div className="job-meta">
                {j.requiredSkills.map((s) => (
                  <span key={s} className="job-chip">{s}</span>
                ))}
              </div>
            </section>
          )}
          <Section title={c.education} html={j.educationRequirements} />
          <div className="job-page__bottom">{applyBtn}</div>
        </article>

        <aside className="job-page__side">
          <div className="job-side-card">
            <ul className="job-card__facts">
              <li><Building2 size={15} /> {job.department}</li>
              <li><MapPin size={15} /> {job.location}</li>
              {j.experienceLevel && <li><Clock size={15} /> {c.experience}: {j.experienceLevel}</li>}
              <li><Users size={15} /> {c.vacancies}: {job.vacancies}</li>
              {job.salaryRange && <li><Wallet size={15} /> {c.salary}: {job.salaryRange}</li>}
              <li><Hourglass size={15} /> {c.deadline}: {formatDay(job.expiresAt, lang)}</li>
            </ul>
            <div style={{ marginTop: 18 }}>{applyBtn}</div>
          </div>
        </aside>
      </div>

      <ApplyDialog job={applying ? job : null} onClose={() => setApplying(false)} />
    </>
  );
}
