import type { EmploymentType, WorkplaceType, JobTranslation } from "@/redux/fetchers/job/jobApi";
import type { Locale } from "@/lib/i18n";

export interface PublicJob {
  id: number;
  title: string;
  slug: string;
  department: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location: string;
  vacancies: number;
  salaryRange: string | null;
  postedAt: string;
  expiresAt: string;
  translations: JobTranslation[];
}

/** Same rule as News: the visitor's language, else the first available translation. */
export const pickTranslation = (j: PublicJob, lang: Locale): JobTranslation =>
  j.translations.find((t) => t.lang === lang.toUpperCase()) ??
  j.translations.find((t) => t.lang === "EN") ??
  j.translations[0];

export const isClosed = (j: PublicJob) => new Date(j.expiresAt).getTime() <= Date.now();
