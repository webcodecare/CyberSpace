"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Building2, Clock, Users, Hourglass } from "lucide-react";
import { useLang } from "@/lib/useLang";
import { formatDay } from "@/lib/format";
import { Button } from "@/components/ui/button";
import ApplyDialog from "./ApplyDialog";
import { isClosed, pickTranslation, type PublicJob } from "./types";
import { jobTypeLabel } from "./labels";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; jobs: PublicJob[] };

export default function CareersClient() {
  const { t, lang } = useLang();
  const c = t.careers;
  const [state, setState] = useState<State>({ status: "loading" });
  const [applying, setApplying] = useState<PublicJob | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/jobs/active", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setState({ status: "ready", jobs: (json.data ?? []) as PublicJob[] });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="job-grid" aria-busy="true" aria-label={c.loading}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="job-card job-card--skeleton">
            <span className="skel skel--md" />
            <span className="skel skel--sm" />
            <span className="skel skel--md" />
            <span className="skel skel--badge" />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="job-state" role="alert">
        <p>{c.error}</p>
        <Button type="button" variant="outline" onClick={load}>
          {c.retry}
        </Button>
      </div>
    );
  }

  // Server already filters expired jobs; also drop any that expired while the page was open.
  const jobs = state.jobs.filter((j) => !isClosed(j));

  if (jobs.length === 0) {
    return (
      <div className="job-state">
        <p>{c.empty}</p>
      </div>
    );
  }

  return (
    <>
      <div className="job-grid">
        {jobs.map((job) => {
          const j = { ...job, ...pickTranslation(job, lang), id: job.id };
          return (
          <article key={j.id} className="job-card">
            <div className="job-card__head">
              <h3 className="job-card__title">
                <Link href={`/${lang}/careers/${job.slug}`} className="job-card__link">
                  {j.title}
                </Link>
              </h3>
              <div className="job-meta">
                <span className="job-chip job-chip--blue">{jobTypeLabel(c, j.employmentType)}</span>
                <span className="job-chip">{jobTypeLabel(c, j.workplaceType)}</span>
              </div>
            </div>
            <ul className="job-card__facts">
              <li><Building2 size={14} /> {j.department}</li>
              <li><MapPin size={14} /> {j.location}</li>
              {j.experienceLevel && <li><Clock size={14} /> {c.experience}: {j.experienceLevel}</li>}
              <li><Users size={14} /> {c.vacancies}: {j.vacancies}</li>
              <li><Hourglass size={14} /> {c.deadline}: {formatDay(j.expiresAt, lang)}</li>
            </ul>
            <p className="job-card__desc">{j.shortDescription}</p>
            <div className="job-card__actions">
              <Button type="button" onClick={() => setApplying(job)}>
                {c.apply}
              </Button>
            </div>
          </article>
          );
        })}
      </div>

      <ApplyDialog job={applying} onClose={() => setApplying(null)} />
    </>
  );
}
