import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/lib/server-auth";

/**
 * Forwards a request to the backend, attaching the auth cookie as a Bearer token.
 * Streams the response back (used for CV downloads) and preserves status and download headers.
 */
export async function proxy(
  req: NextRequest,
  path: string,
  opts: { auth?: "required" | "none" } = {},
) {
  const token = await getAuthToken();
  if (opts.auth === "required" && !token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const headers: Record<string, string> = {};
  const ct = req.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;
  if (token) headers.Authorization = `Bearer ${token}`;
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) headers["X-Forwarded-For"] = fwd;

  const hasBody = !["GET", "HEAD"].includes(req.method);
  try {
    const res = await fetch(`${BACKEND_URL}${path}${req.nextUrl.search}`, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      cache: "no-store",
    });
    const out = new Headers();
    for (const h of ["content-type", "content-disposition", "cache-control", "x-content-type-options"]) {
      const v = res.headers.get(h);
      if (v) out.set(h, v);
    }
    return new NextResponse(res.status === 204 ? null : res.body, { status: res.status, headers: out });
  } catch {
    return NextResponse.json({ message: "Service unavailable" }, { status: 503 });
  }
}
