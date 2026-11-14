import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { serverGet } from "@/lib/server-api";
import { stripTags } from "@/lib/format";
import JobDetailView from "@/components/careers/JobDetailView";
import { isClosed, pickTranslation, type PublicJob } from "@/components/careers/types";

const fetchJob = (slug: string) =>
  serverGet<PublicJob | null>(`/jobs/active/${encodeURIComponent(slug)}`, null, ["jobs"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const job = await fetchJob(slug);
  if (!job) return {};
  const tr = pickTranslation(job, lang);
  return pageMeta(lang, `/careers/${slug}`, tr.title, tr.shortDescription || stripTags(tr.description).slice(0, 160));
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const job = await fetchJob(slug);
  if (!job || isClosed(job)) notFound();
  return (
    <section className="container section">
      <JobDetailView job={job} />
    </section>
  );
}
