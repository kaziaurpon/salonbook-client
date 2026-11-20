import { NextRequest, NextResponse } from "next/server";
import { loginPathFor } from "@/lib/auth-redirect";

function hasBetterAuthSessionCookie(request: NextRequest) {
  // Cookie presence only avoids an unnecessary page render. Server layouts and
  // Express still verify the actual session/JWT and current role.
  return request.cookies.getAll().some(({ name }) => name.endsWith("better-auth.session_token"));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isServiceDetail = /^\/services\/[^/]+\/?$/.test(pathname);
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  if (!isServiceDetail && !isDashboard) return NextResponse.next();

  const requestedPath = `${pathname}${search}`;
  if (!hasBetterAuthSessionCookie(request)) {
    return NextResponse.redirect(new URL(loginPathFor(requestedPath), request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-salonbook-request-path", requestedPath);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/services/:path*", "/dashboard/:path*"],
};
