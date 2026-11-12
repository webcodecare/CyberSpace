import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export interface ApiUser {
  id: number;
  name?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<ApiUser[], void>({
      query: () => "/admin/users",
      providesTags: [tagTypes.user],
      transformResponse: (res: { data?: ApiUser[] }) => res.data ?? [],
    }),
    updateUser: builder.mutation<
      { success: boolean },
      { id: number; role?: string; isActive?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.user],
    }),
    deleteUser: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.user],
    }),
    createAdmin: builder.mutation<
      { success: boolean },
      { name: string; email: string; password: string }
    >({
      query: (body) => ({ url: "/admin/users", method: "POST", body }),
      invalidatesTags: [tagTypes.user],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateAdminMutation,
} = userApi;
