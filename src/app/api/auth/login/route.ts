import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, COOKIE_NAME } from "@/lib/server-auth";
import { JwtDecode } from "@/lib/jwt_decode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Login failed" }, { status: res.status });
    }
    const { access_token } = data.data;
    const user = JwtDecode(access_token);
    const response = NextResponse.json({ success: true, data: user });
    response.cookies.set(COOKIE_NAME, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
