import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export interface SettingsData {
  showPrices: boolean;
  showStock: boolean;
}

interface ApiSetting {
  key: string;
  value: boolean;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<SettingsData, void>({
      query: () => "/settings",
      providesTags: [tagTypes.settings],
      transformResponse: (res: { data?: ApiSetting[] }) => {
        const s = res.data ?? [];
        return {
          showPrices: s.find((x) => x.key === "showPrices")?.value ?? true,
          showStock: s.find((x) => x.key === "showStock")?.value ?? true,
        };
      },
    }),
    updateSettings: builder.mutation<{ success: boolean }, { key: string; value: boolean }>({
      query: (body) => ({ url: "/admin/settings", method: "PATCH", body }),
      invalidatesTags: [tagTypes.settings],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
