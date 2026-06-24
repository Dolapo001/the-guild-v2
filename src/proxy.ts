import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware: auth gating + (optional) install-first PWA-mode gating.
 *
 * It can only read cookies — it cannot see `display-mode: standalone` (that's
 * client-only). So PWA-mode here is a best-effort, no-flash hint based on the
 * `app-mode` cookie that the client sets when running standalone; the reliable
 * gate is the client `AppModeGuard`, and real access control is the auth cookie
 * + backend permissions.
 */
const ACCESS_COOKIE = process.env.AUTH_COOKIE_ACCESS || "access_token";
const REFRESH_COOKIE = process.env.AUTH_COOKIE_REFRESH || "refresh_token";
// Enforce "app functionality is install-only" at the edge. Off by default so
// browser development keeps working; set PWA_ENFORCE=1 in production.
const ENFORCE_PWA = process.env.PWA_ENFORCE === "1";

// App routes (the real URLs behind the (dashboard) route group).
const APP_PREFIXES = [
  "/customer", "/home", "/admin", "/staff", "/staff-portal", "/business",
  "/profile", "/wallet", "/bookings", "/inbox", "/marketplace", "/inventory",
  "/job-history", "/reviews", "/active-job", "/favorites", "/verification",
  "/onboarding", "/search", "/settings", "/messages", "/workspace",
];
// Always reachable in a browser tab (marketing, install funnel, auth, entry).
const AUTH_PAGES = ["/login", "/register"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(
    req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get(REFRESH_COOKIE)?.value,
  );
  const isStandalone = req.cookies.get("app-mode")?.value === "standalone";

  const isAppRoute = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // 1) App routes require a session.
  if (isAppRoute && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2) Install-first: app routes and auth are only for the installed (standalone) app.
  // If visited in a browser tab, they are redirected to the landing page.
  if ((isAppRoute || isAuthPage) && ENFORCE_PWA && !isStandalone) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3) Authenticated users shouldn't see the auth screens — route via the app
  //    entry point so it can pick the right role dashboard.
  //    If the session is expired (client passed ?expired=true), stay on login.
  if (isAuthPage && hasSession && !req.nextUrl.searchParams.has("expired")) {
    const url = req.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, the image optimizer, and the API proxy.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)"],
};
