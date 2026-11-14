import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type WorkplaceType = "ON_SITE" | "REMOTE" | "HYBRID";
export type JobStatus = "DRAFT" | "PUBLISHED" | "EXPIRED";
export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";
export type EmailStatus = "PENDING" | "SENT" | "FAILED";

export type JobLang = "EN" | "AZ" | "RU";
export const JOB_LANGS: JobLang[] = ["EN", "AZ", "RU"];

export interface JobTranslation {
  lang: JobLang;
  title: string;
  shortDescription: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string;
  requiredSkills: string[];
  experienceLevel: string | null;
  educationRequirements: string | null;
}

export interface Job {
  id: number;
  /** EN title (fallback: first language); stable across dashboard languages. */
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
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  translations: JobTranslation[];
  _count: { applications: number };
}

export interface JobInput {
  department: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location: string;
  vacancies: number;
  salaryRange?: string | null;
  postedAt?: string;
  expiresAt: string;
  status: JobStatus;
  translations: JobTranslation[];
}

export interface JobApplication {
  id: number;
  jobId: number;
  job: { id: number; title: string; department: string; location?: string };
  fullName: string;
  email: string;
  phone: string;
  cvOriginalName: string;
  cvMimeType: string;
  cvSize: number;
  message: string | null;
  status: ApplicationStatus;
  emailStatus: EmailStatus;
  emailError: string | null;
  emailAttempts: number;
  appliedAt: string;
  updatedAt: string;
}

export interface Paged<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface RecruitmentStats {
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  draftJobs: number;
  totalApplications: number;
  pendingApplications: number;
  applicationsPerJob: { id: number; title: string; applications: number }[];
}

export interface JobListArgs {
  search?: string;
  status?: JobStatus | "";
  page?: number;
  limit?: number;
}
export interface ApplicationListArgs {
  jobId?: number | "";
  status?: ApplicationStatus | "";
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const qs = (o: object) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};

const paged = <T>(res: { data?: T[]; meta?: Paged<T>["meta"] }): Paged<T> => ({
  data: res.data ?? [],
  meta: res.meta ?? { page: 1, limit: 10, total: 0 },
});

export const jobApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getJobs: b.query<Paged<Job>, JobListArgs | void>({
      query: (a) => `/jobs${qs(a ?? {})}`,
      providesTags: [tagTypes.job],
      transformResponse: paged<Job>,
    }),
    getJobStats: b.query<RecruitmentStats, void>({
      query: () => "/jobs/stats",
      providesTags: [tagTypes.job, tagTypes.jobApplication],
      transformResponse: (res: { data: RecruitmentStats }) => res.data,
    }),
    createJob: b.mutation<Job, JobInput>({
      query: (body) => ({ url: "/jobs", method: "POST", body }),
      invalidatesTags: [tagTypes.job],
      transformResponse: (res: { data: Job }) => res.data,
    }),
    updateJob: b.mutation<Job, { id: number; body: Partial<JobInput> }>({
      query: ({ id, body }) => ({ url: `/jobs/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.job],
      transformResponse: (res: { data: Job }) => res.data,
    }),
    setJobStatus: b.mutation<Job, { id: number; status: "DRAFT" | "PUBLISHED" }>({
      query: ({ id, status }) => ({ url: `/jobs/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: [tagTypes.job],
      transformResponse: (res: { data: Job }) => res.data,
    }),
    deleteJob: b.mutation<void, number>({
      query: (id) => ({ url: `/jobs/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.job, tagTypes.jobApplication],
    }),
    getApplications: b.query<Paged<JobApplication>, ApplicationListArgs | void>({
      query: (a) => `/job-applications${qs(a ?? {})}`,
      providesTags: [tagTypes.jobApplication],
      transformResponse: paged<JobApplication>,
    }),
    updateApplicationStatus: b.mutation<JobApplication, { id: number; status: ApplicationStatus }>({
      query: ({ id, status }) => ({ url: `/job-applications/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: [tagTypes.jobApplication],
      transformResponse: (res: { data: JobApplication }) => res.data,
    }),
    resendApplicationEmail: b.mutation<JobApplication, number>({
      query: (id) => ({ url: `/job-applications/${id}/resend-email`, method: "POST" }),
      invalidatesTags: [tagTypes.jobApplication],
      transformResponse: (res: { data: JobApplication }) => res.data,
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobStatsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useSetJobStatusMutation,
  useDeleteJobMutation,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useResendApplicationEmailMutation,
} = jobApi;

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};
export const WORKPLACE_LABEL: Record<WorkplaceType, string> = {
  ON_SITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
];
