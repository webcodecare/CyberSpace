import { BACKEND_URL, getAuthToken } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const res = await fetch(`${BACKEND_URL}/inquiries`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND_URL}/inquiries`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to submit inquiry" }, { status: 500 });
  }
}
