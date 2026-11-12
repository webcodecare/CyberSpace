import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";
import type { PublicProduct, CategoryId } from "@/data/catalog";

interface ApiProductTranslation {
  id: number;
  lang: string;
  name: string;
  description: string | null;
}

interface ApiProduct {
  id: string;
  sku: string;
  brand: string | null;
  category: string;
  imageUrl: string | null;
  price: string | number | null;
  currency: string | null;
  stock: number | null;
  syncedAt: string;
  translations: ApiProductTranslation[];
}

function toPublicProduct(p: ApiProduct): PublicProduct {
  const names: Record<string, string> = {};
  const descriptions: Record<string, string> = {};
  for (const t of p.translations) {
    const lang = t.lang.toLowerCase();
    names[lang] = t.name;
    if (t.description) descriptions[lang] = t.description;
  }
  const name = names["en"] ?? names["az"] ?? names["ru"] ?? Object.values(names)[0] ?? p.sku;
  return {
    id: p.id,
    sku: p.sku,
    name,
    names,
    descriptions,
    brand: p.brand ?? "",
    imageUrl: p.imageUrl ?? null,
    category: p.category as CategoryId,
    price: p.price != null ? parseFloat(String(p.price)) : null,
    currency: (p.currency as "USD" | "AZN") ?? null,
    stock: p.stock ?? null,
    specs: [],
  };
}

export interface CreateProductInput {
  sku: string;
  brand?: string;
  category: string;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  stock?: number | null;
  translations: { lang: "AZ" | "EN" | "RU"; name: string; description?: string }[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PublicProduct[], void>({
      query: () => "/products",
      providesTags: [tagTypes.product],
      transformResponse: (res: { data?: ApiProduct[] }) => (res.data ?? []).map(toPublicProduct),
    }),
    createProduct: builder.mutation<ApiProduct, CreateProductInput>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [tagTypes.product],
      transformResponse: (res: { data?: ApiProduct }) => res.data!,
    }),
    updateProduct: builder.mutation<ApiProduct, { id: string; body: UpdateProductInput }>({
      query: ({ id, body }) => ({
        url: `/products/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.product],
      transformResponse: (res: { data?: ApiProduct }) => res.data!,
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
