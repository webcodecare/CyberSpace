import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";
import type { DecodedUser } from "@/lib/jwt_decode";
import { setUser } from "./authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query<DecodedUser, void>({
      query: () => "/auth/me",
      providesTags: [tagTypes.user],
      transformResponse: (res: { success?: boolean; data?: DecodedUser }) => res.data!,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const user = await queryFulfilled.then((res) => res.data).catch(() => null);
        if (user) dispatch(setUser({ user }));
      },
    }),
    login: builder.mutation<{ success: boolean; data: DecodedUser }, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: [tagTypes.user],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled.then((r) => r.data).catch(() => null);
        if (res) dispatch(setUser({ user: res.data }));
      },
    }),
    register: builder.mutation<{ success: boolean; data: DecodedUser }, { name: string; email: string; password: string }>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: [tagTypes.user],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled.then((r) => r.data).catch(() => null);
        if (res) dispatch(setUser({ user: res.data }));
      },
    }),
    logoutFromDb: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: [tagTypes.user],
    }),
    changePassword: builder.mutation<{ success: boolean }, { old_password: string; new_password: string }>({
      query: (body) => ({ url: "/user/change-password", method: "PATCH", body }),
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutFromDbMutation,
  useChangePasswordMutation,
} = authApi;
