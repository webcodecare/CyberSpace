import { revalidateTag } from "next/cache";
import { BACKEND_URL } from "@/lib/server-auth";

/** Seconds public (unauthenticated) content is cached on the server before revalidation. */
export const PUBLIC_REVALIDATE = 60;

/**
 * Server-only GET for public content rendered in Server Components (SEO / first paint).
 * Authenticated and admin data must go through RTK Query + `baseApi` instead.
 * Results are cached (ISR) and de-duplicated across generateMetadata + page render.
 * Returns `fallback` on any failure so pages never throw on backend downtime.
 */
export async function serverGet<T>(path: string, fallback: T, tags: string[] = []): Promise<T> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      next: { revalidate: PUBLIC_REVALIDATE, tags },
    });
    if (!res.ok) return fallback;
    const json = await res.json();
    return (json.data ?? json ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/** Cache tags for public content. Pages tag their fetches with these; admin mutation routes invalidate them. */
export const CACHE_TAGS = {
  news: "news",
  partners: "partners",
  categories: "categories",
  products: "products",
  career: "career",
} as const;
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** Call from admin mutation routes: drops the tagged public cache only when the backend write succeeded. */
export function revalidateIfOk(res: Response, tag: CacheTag) {
  if (res.ok) revalidateTag(tag);
}
