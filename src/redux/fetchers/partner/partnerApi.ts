import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export interface Partner {
  id: number;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CreatePartnerInput = Omit<Partner, "id" | "createdAt" | "updatedAt">;
export type UpdatePartnerInput = Partial<CreatePartnerInput>;

export const partnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<Partner[], void>({
      query: () => "/partners",
      providesTags: [tagTypes.partner],
      transformResponse: (res: { data?: Partner[] }) => res.data ?? [],
    }),
    createPartner: builder.mutation<Partner, CreatePartnerInput>({
      query: (body) => ({ url: "/partners", method: "POST", body }),
      invalidatesTags: [tagTypes.partner],
      transformResponse: (res: { data?: Partner }) => res.data!,
    }),
    updatePartner: builder.mutation<Partner, { id: number; body: UpdatePartnerInput }>({
      query: ({ id, body }) => ({ url: `/partners/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.partner],
      transformResponse: (res: { data?: Partner }) => res.data!,
    }),
    deletePartner: builder.mutation<void, number>({
      query: (id) => ({ url: `/partners/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.partner],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
} = partnerApi;
