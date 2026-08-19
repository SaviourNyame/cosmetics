import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/session-constants";

const PROTECTED_PREFIXES = ["/admin", "/supplier"];

/**
 * Soft gate only: redirects to /login when the session cookie is entirely
 * absent. Proxy defaults to the Node.js runtime as of Next.js 16, but the
 * real verification (session cookie signature + role claim) still happens
 * in app/admin/layout.tsx and app/supplier/layout.tsx via requireRole()
 * (lib/auth.ts) — that's the authoritative security boundary regardless of
 * which runtime this file executes in.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/supplier/:path*", "/login"],
};
