import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/i18n";

const COOKIE_NAME = "auth-token";

function decodeJwtRole(token: string): "ADMIN" | "SALES" | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect bare root to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url));
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const role = token ? decodeJwtRole(token) : null;

  // Detect dashboard/login/register paths
  const isDashboard = /^\/[^/]+\/dashboard/.test(pathname);
  const isLogin = /^\/[^/]+\/login/.test(pathname);
  const isRegister = /^\/[^/]+\/register/.test(pathname);

  const langMatch = pathname.match(/^\/([^/]+)/);
  const lang = langMatch ? langMatch[1] : DEFAULT_LOCALE;

  // Redirect unauthenticated users away from dashboard
  if (isDashboard && !role) {
    return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
  }

  // Redirect authenticated users from login/register to dashboard
  if ((isLogin || isRegister) && role) {
    return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
  }

  // Role-based dashboard access
  if (isDashboard && role) {
    const isAdminPath = pathname.includes("/dashboard/admin");
    const isSalesPath = pathname.includes("/dashboard/sales");
    const isDashboardRoot = /^\/[^/]+\/dashboard\/?$/.test(pathname);

    // Redirect from dashboard root to role-specific
    if (isDashboardRoot) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL(`/${lang}/dashboard/admin`, request.url));
      } else {
        return NextResponse.redirect(new URL(`/${lang}/dashboard/sales`, request.url));
      }
    }

    // Prevent SALES from accessing admin pages
    if (isAdminPath && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${lang}/dashboard/sales`, request.url));
    }

    // Prevent ADMIN from accessing sales pages (optional: redirect to admin)
    if (isSalesPath && role === "ADMIN") {
      return NextResponse.redirect(new URL(`/${lang}/dashboard/admin`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(az|en|ru)/dashboard/:path*", "/(az|en|ru)/login", "/(az|en|ru)/register"],
};
