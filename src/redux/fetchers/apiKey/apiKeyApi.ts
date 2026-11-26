import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export type ApiKeyStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export interface ApiPermissionDef {
  id: string;
  group: string;
  label: string;
  description: string;
}

export interface ApiKeyRow {
  id: number;
  name: string;
  prefix: string;
  /** True when the full key can be copied again (created after copy support, not revoked). */
  canCopy: boolean;
  permissions: string[];
  allowedIps: string[];
  status: ApiKeyStatus;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  createdAt: string;
  createdBy: { id: number; name: string | null; email: string } | null;
  requests24h: number;
}

/** Returned once, by create. `secret` is never retrievable again. */
export type CreatedApiKey = Omit<ApiKeyRow, "requests24h"> & { secret: string };

export interface ApiOverview {
  keys: { total: number; active: number; revoked: number; expired: number };
  last24h: { requests: number; errors: number; avgDurationMs: number };
}

export interface ApiMeta {
  permissions: ApiPermissionDef[];
  baseUrl: string;
  rateLimitPerMinute: number;
  logRetentionDays: number;
  maxRequestBytes: number;
  overview: ApiOverview;
}

export interface ApiLogRow {
  id: number;
  apiKeyId: number | null;
  keyName: string | null;
  keyPrefix: string | null;
  method: string;
  path: string;
  statusCode: number;
  success: boolean;
  durationMs: number;
  ip: string | null;
  userAgent: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface ApiLogsQuery {
  page?: number;
  limit?: number;
  apiKeyId?: number;
  method?: string;
  outcome?: "success" | "failure";
}

export interface ApiLogsResult {
  items: ApiLogRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateApiKeyInput {
  name: string;
  permissions: string[];
  allowedIps?: string[];
  expiresAt?: string | null;
}

export type UpdateApiKeyInput = Partial<CreateApiKeyInput>;

export const apiKeyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApiMeta: builder.query<ApiMeta, void>({
      query: () => "/admin/api-keys/meta",
      providesTags: [tagTypes.apiKey],
      transformResponse: (res: { data: ApiMeta }) => res.data,
    }),
    getApiKeys: builder.query<ApiKeyRow[], void>({
      query: () => "/admin/api-keys",
      providesTags: [tagTypes.apiKey],
      transformResponse: (res: { data?: ApiKeyRow[] }) => res.data ?? [],
    }),
    createApiKey: builder.mutation<CreatedApiKey, CreateApiKeyInput>({
      query: (body) => ({ url: "/admin/api-keys", method: "POST", body }),
      invalidatesTags: [tagTypes.apiKey],
      transformResponse: (res: { data: CreatedApiKey }) => res.data,
    }),
    // Secret is never cached or tagged: fetched on click, dropped immediately.
    revealApiKey: builder.query<{ id: number; secret: string }, number>({
      query: (id) => `/admin/api-keys/${id}/secret`,
      keepUnusedDataFor: 0,
      transformResponse: (res: { data: { id: number; secret: string } }) => res.data,
    }),
    updateApiKey: builder.mutation<ApiKeyRow, { id: number; body: UpdateApiKeyInput }>({
      query: ({ id, body }) => ({ url: `/admin/api-keys/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.apiKey],
      transformResponse: (res: { data: ApiKeyRow }) => res.data,
    }),
    revokeApiKey: builder.mutation<ApiKeyRow, number>({
      query: (id) => ({ url: `/admin/api-keys/${id}/revoke`, method: "POST" }),
      invalidatesTags: [tagTypes.apiKey],
      transformResponse: (res: { data: ApiKeyRow }) => res.data,
    }),
    deleteApiKey: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/api-keys/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.apiKey],
    }),
    getApiLogs: builder.query<ApiLogsResult, ApiLogsQuery>({
      query: (params) => ({ url: "/admin/api-keys/logs", params }),
      providesTags: [tagTypes.apiKey],
      transformResponse: (res: { data?: ApiLogRow[]; meta?: ApiLogsResult["meta"] }) => ({
        items: res.data ?? [],
        meta: res.meta ?? { page: 1, limit: 25, total: 0, totalPages: 1 },
      }),
    }),
  }),
});

export const {
  useGetApiMetaQuery,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useLazyRevealApiKeyQuery,
  useUpdateApiKeyMutation,
  useRevokeApiKeyMutation,
  useDeleteApiKeyMutation,
  useGetApiLogsQuery,
} = apiKeyApi;

/** Pulls the backend's error message out of an RTK Query error. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const data = (err as { data?: { message?: string; error?: { message?: string }[] | string } })?.data;
  const first = Array.isArray(data?.error) ? data.error[0]?.message : undefined;
  return first || data?.message || (typeof data?.error === "string" ? data.error : undefined) || fallback;
}
