import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

/**
 * Admin-only pass-through to the backend `/api-keys` management API (list, create, update,
 * revoke, delete, logs, meta). The browser never sees or sends anything but the httpOnly session cookie;
 * the backend re-checks that the JWT belongs to an active ADMIN.
 */
const SEGMENT = /^[A-Za-z0-9_-]+$/;

async function forward(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params;
  if (!path.every((s) => SEGMENT.test(s))) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }
  return proxy(req, `/api-keys${path.length ? `/${path.join("/")}` : ""}`, { auth: "required" });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
