import { BACKEND_URL, getAuthToken } from "@/lib/server-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const res = await fetch(`${BACKEND_URL}/inquiries/my`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to fetch inquiries" }, { status: 500 });
  }
}
