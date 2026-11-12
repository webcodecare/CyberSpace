import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export interface CareerPage {
  id: number;
  heroTitleAZ: string | null;
  heroTitleEN: string | null;
  heroTitleRU: string | null;
  heroDescAZ: string | null;
  heroDescEN: string | null;
  heroDescRU: string | null;
  heroImageUrl: string | null;
  heroCta1AZ: string | null;
  heroCta1EN: string | null;
  heroCta1RU: string | null;
  heroCta2AZ: string | null;
  heroCta2EN: string | null;
  heroCta2RU: string | null;
  introHeadingAZ: string | null;
  introHeadingEN: string | null;
  introHeadingRU: string | null;
  introBodyAZ: string | null;
  introBodyEN: string | null;
  introBodyRU: string | null;
  introImageUrl: string | null;
  missionAZ: string | null;
  missionEN: string | null;
  missionRU: string | null;
  visionAZ: string | null;
  visionEN: string | null;
  visionRU: string | null;
  cultureHeadingAZ: string | null;
  cultureHeadingEN: string | null;
  cultureHeadingRU: string | null;
  cultureBodyAZ: string | null;
  cultureBodyEN: string | null;
  cultureBodyRU: string | null;
  seoTitleAZ: string | null;
  seoTitleEN: string | null;
  seoTitleRU: string | null;
  seoDescAZ: string | null;
  seoDescEN: string | null;
  seoDescRU: string | null;
  isPublished: boolean;
  updatedAt: string;
}
export type UpdateCareerPageInput = Partial<Omit<CareerPage, "id" | "updatedAt">>;

export interface CareerBenefit {
  id: number;
  icon: string | null;
  imageUrl: string | null;
  titleAZ: string;
  titleEN: string;
  titleRU: string;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
export type CreateCareerBenefitInput = Omit<CareerBenefit, "id" | "createdAt" | "updatedAt">;
export type UpdateCareerBenefitInput = Partial<CreateCareerBenefitInput>;

export interface CareerExpertise {
  id: number;
  icon: string | null;
  titleAZ: string;
  titleEN: string;
  titleRU: string;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
export type CreateCareerExpertiseInput = Omit<CareerExpertise, "id" | "createdAt" | "updatedAt">;
export type UpdateCareerExpertiseInput = Partial<CreateCareerExpertiseInput>;

export interface CareerGalleryImage {
  id: number;
  imageUrl: string;
  captionAZ: string | null;
  captionEN: string | null;
  captionRU: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}
export type CreateCareerGalleryImageInput = Omit<CareerGalleryImage, "id" | "createdAt">;
export type UpdateCareerGalleryImageInput = Partial<CreateCareerGalleryImageInput>;

export interface CareerOpportunity {
  id: number;
  titleAZ: string;
  titleEN: string;
  titleRU: string;
  department: string | null;
  location: string | null;
  typeAZ: string | null;
  typeEN: string | null;
  typeRU: string | null;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
export type CreateCareerOpportunityInput = Omit<
  CareerOpportunity,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCareerOpportunityInput = Partial<CreateCareerOpportunityInput>;

export type CareerApplicationStatus = "NEW" | "REVIEWED" | "SHORTLISTED" | "REJECTED";

export interface CareerApplication {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  positionApplied: string;
  country: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  yearsExperience: number | null;
  coverLetter: string | null;
  resumeFileName: string;
  status: CareerApplicationStatus;
  createdAt: string;
}

export const careerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Page settings
    getCareerPage: builder.query<CareerPage, void>({
      query: () => "/career/page",
      providesTags: [tagTypes.careerPage],
      transformResponse: (res: { data?: CareerPage }) => res.data!,
    }),
    updateCareerPage: builder.mutation<CareerPage, UpdateCareerPageInput>({
      query: (body) => ({ url: "/career/page", method: "PATCH", body }),
      invalidatesTags: [tagTypes.careerPage],
      transformResponse: (res: { data?: CareerPage }) => res.data!,
    }),

    // Benefits
    getCareerBenefits: builder.query<CareerBenefit[], void>({
      query: () => "/career/benefits",
      providesTags: [tagTypes.careerBenefit],
      transformResponse: (res: { data?: CareerBenefit[] }) => res.data ?? [],
    }),
    createCareerBenefit: builder.mutation<CareerBenefit, CreateCareerBenefitInput>({
      query: (body) => ({ url: "/career/benefits", method: "POST", body }),
      invalidatesTags: [tagTypes.careerBenefit],
      transformResponse: (res: { data?: CareerBenefit }) => res.data!,
    }),
    updateCareerBenefit: builder.mutation<
      CareerBenefit,
      { id: number; body: UpdateCareerBenefitInput }
    >({
      query: ({ id, body }) => ({ url: `/career/benefits/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.careerBenefit],
      transformResponse: (res: { data?: CareerBenefit }) => res.data!,
    }),
    deleteCareerBenefit: builder.mutation<void, number>({
      query: (id) => ({ url: `/career/benefits/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.careerBenefit],
    }),

    // Expertise
    getCareerExpertise: builder.query<CareerExpertise[], void>({
      query: () => "/career/expertise",
      providesTags: [tagTypes.careerExpertise],
      transformResponse: (res: { data?: CareerExpertise[] }) => res.data ?? [],
    }),
    createCareerExpertise: builder.mutation<CareerExpertise, CreateCareerExpertiseInput>({
      query: (body) => ({ url: "/career/expertise", method: "POST", body }),
      invalidatesTags: [tagTypes.careerExpertise],
      transformResponse: (res: { data?: CareerExpertise }) => res.data!,
    }),
    updateCareerExpertise: builder.mutation<
      CareerExpertise,
      { id: number; body: UpdateCareerExpertiseInput }
    >({
      query: ({ id, body }) => ({ url: `/career/expertise/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.careerExpertise],
      transformResponse: (res: { data?: CareerExpertise }) => res.data!,
    }),
    deleteCareerExpertise: builder.mutation<void, number>({
      query: (id) => ({ url: `/career/expertise/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.careerExpertise],
    }),

    // Gallery
    getCareerGallery: builder.query<CareerGalleryImage[], void>({
      query: () => "/career/gallery",
      providesTags: [tagTypes.careerGallery],
      transformResponse: (res: { data?: CareerGalleryImage[] }) => res.data ?? [],
    }),
    createCareerGalleryImage: builder.mutation<CareerGalleryImage, CreateCareerGalleryImageInput>({
      query: (body) => ({ url: "/career/gallery", method: "POST", body }),
      invalidatesTags: [tagTypes.careerGallery],
      transformResponse: (res: { data?: CareerGalleryImage }) => res.data!,
    }),
    updateCareerGalleryImage: builder.mutation<
      CareerGalleryImage,
      { id: number; body: UpdateCareerGalleryImageInput }
    >({
      query: ({ id, body }) => ({ url: `/career/gallery/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.careerGallery],
      transformResponse: (res: { data?: CareerGalleryImage }) => res.data!,
    }),
    deleteCareerGalleryImage: builder.mutation<void, number>({
      query: (id) => ({ url: `/career/gallery/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.careerGallery],
    }),

    // Opportunities
    getCareerOpportunities: builder.query<CareerOpportunity[], void>({
      query: () => "/career/opportunities",
      providesTags: [tagTypes.careerOpportunity],
      transformResponse: (res: { data?: CareerOpportunity[] }) => res.data ?? [],
    }),
    createCareerOpportunity: builder.mutation<CareerOpportunity, CreateCareerOpportunityInput>({
      query: (body) => ({ url: "/career/opportunities", method: "POST", body }),
      invalidatesTags: [tagTypes.careerOpportunity],
      transformResponse: (res: { data?: CareerOpportunity }) => res.data!,
    }),
    updateCareerOpportunity: builder.mutation<
      CareerOpportunity,
      { id: number; body: UpdateCareerOpportunityInput }
    >({
      query: ({ id, body }) => ({ url: `/career/opportunities/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.careerOpportunity],
      transformResponse: (res: { data?: CareerOpportunity }) => res.data!,
    }),
    deleteCareerOpportunity: builder.mutation<void, number>({
      query: (id) => ({ url: `/career/opportunities/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.careerOpportunity],
    }),

    // Applications
    submitCareerApplication: builder.mutation<CareerApplication, FormData>({
      query: (body) => ({ url: "/career/applications", method: "POST", body }),
      invalidatesTags: [tagTypes.careerApplication],
      transformResponse: (res: { data?: CareerApplication }) => res.data!,
    }),
    getCareerApplications: builder.query<CareerApplication[], void>({
      query: () => "/career/applications",
      providesTags: [tagTypes.careerApplication],
      transformResponse: (res: { data?: CareerApplication[] }) => res.data ?? [],
    }),
    getCareerApplicationById: builder.query<CareerApplication, number>({
      query: (id) => `/career/applications/${id}`,
      providesTags: [tagTypes.careerApplication],
      transformResponse: (res: { data?: CareerApplication }) => res.data!,
    }),
    updateCareerApplicationStatus: builder.mutation<
      CareerApplication,
      { id: number; status: CareerApplicationStatus }
    >({
      query: ({ id, status }) => ({
        url: `/career/applications/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [tagTypes.careerApplication],
      transformResponse: (res: { data?: CareerApplication }) => res.data!,
    }),
    deleteCareerApplication: builder.mutation<void, number>({
      query: (id) => ({ url: `/career/applications/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.careerApplication],
    }),
  }),
});

export const {
  useGetCareerPageQuery,
  useUpdateCareerPageMutation,
  useGetCareerBenefitsQuery,
  useCreateCareerBenefitMutation,
  useUpdateCareerBenefitMutation,
  useDeleteCareerBenefitMutation,
  useGetCareerExpertiseQuery,
  useCreateCareerExpertiseMutation,
  useUpdateCareerExpertiseMutation,
  useDeleteCareerExpertiseMutation,
  useGetCareerGalleryQuery,
  useCreateCareerGalleryImageMutation,
  useUpdateCareerGalleryImageMutation,
  useDeleteCareerGalleryImageMutation,
  useGetCareerOpportunitiesQuery,
  useCreateCareerOpportunityMutation,
  useUpdateCareerOpportunityMutation,
  useDeleteCareerOpportunityMutation,
  useSubmitCareerApplicationMutation,
  useGetCareerApplicationsQuery,
  useGetCareerApplicationByIdQuery,
  useUpdateCareerApplicationStatusMutation,
  useDeleteCareerApplicationMutation,
} = careerApi;
