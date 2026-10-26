import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export interface NewsTranslation {
  id: number;
  lang: "AZ" | "EN" | "RU";
  title: string;
  excerpt: string;
  body: string;
}

export interface NewsItem {
  id: number;
  slug: string;
  imageUrl: string | null;
  authorName: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  translations: NewsTranslation[];
}

export interface CreateNewsInput {
  slug: string;
  imageUrl?: string;
  authorName?: string;
  status?: "DRAFT" | "PUBLISHED";
  publishedAt?: string;
  order?: number;
  translations: {
    lang: "AZ" | "EN" | "RU";
    title: string;
    excerpt: string;
    body: string;
  }[];
}

export type UpdateNewsInput = Partial<CreateNewsInput>;

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query<NewsItem[], void>({
      query: () => "/news",
      providesTags: [tagTypes.news],
      transformResponse: (res: { data?: NewsItem[] }) => res.data ?? [],
    }),
    getPublishedNews: builder.query<NewsItem[], void>({
      query: () => "/news/published",
      providesTags: [tagTypes.news],
      transformResponse: (res: { data?: NewsItem[] }) => res.data ?? [],
    }),
    getNewsBySlug: builder.query<NewsItem, string>({
      query: (slug) => `/news/slug/${encodeURIComponent(slug)}`,
      providesTags: [tagTypes.news],
      transformResponse: (res: { data?: NewsItem }) => res.data!,
    }),
    getNewsById: builder.query<NewsItem, number>({
      query: (id) => `/news/${id}`,
      providesTags: [tagTypes.news],
      transformResponse: (res: { data?: NewsItem }) => res.data!,
    }),
    createNews: builder.mutation<NewsItem, CreateNewsInput>({
      query: (body) => ({ url: "/news", method: "POST", body }),
      invalidatesTags: [tagTypes.news],
      transformResponse: (res: { data?: NewsItem }) => res.data!,
    }),
    updateNews: builder.mutation<NewsItem, { id: number; body: UpdateNewsInput }>({
      query: ({ id, body }) => ({ url: `/news/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.news],
      transformResponse: (res: { data?: NewsItem }) => res.data!,
    }),
    deleteNews: builder.mutation<void, number>({
      query: (id) => ({ url: `/news/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.news],
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetPublishedNewsQuery,
  useGetNewsBySlugQuery,
  useGetNewsByIdQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
