import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SSR route protection for httpOnly cookie auth.
 *
 * The middleware runs on the Edge before a protected page renders. It only
 * checks for the *presence* of the access cookie (it cannot verify the JWT
 * signature without the secret) — full authorization is still enforced by the
 * backend on every API call. This prevents an unauthenticated SSR flash of
 * dashboard pages and bounces logged-in users away from the auth screens.
 */
const ACCESS_COOKIE = process.env.AUTH_COOKIE_ACCESS || "access_token";
const REFRESH_COOKIE = process.env.AUTH_COOKIE_REFRESH || "refresh_token";

// Route groups are a Next.js routing concept and are NOT part of the URL, so
// matchers use the real path segments.
const PROTECTED_PREFIXES = [
  "/customer", "/home", "/admin", "/staff", "/staff-portal", "/business",
  "/profile", "/wallet", "/bookings", "/inbox", "/marketplace", "/inventory",
  "/job-history", "/reviews", "/active-job", "/favorites", "/verification",
  "/onboarding", "/search",
];
const AUTH_PAGES = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Either cookie indicates an active session: the access cookie may have
  // expired (30 min) while the refresh cookie (7 days) is still valid — the
  // api-client transparently refreshes access on the first 401.
  const hasSession = Boolean(
    req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get(REFRESH_COOKIE)?.value,
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, image optimizer, and the API proxy.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)"],
};
