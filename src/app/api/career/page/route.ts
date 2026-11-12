import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/lib/server-auth";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/career/page`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ data: null }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ data: null }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/career/page`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  revalidateIfOk(res, CACHE_TAGS.career);
  return NextResponse.json(await res.json(), { status: res.status });
}
