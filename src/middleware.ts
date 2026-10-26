import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-token";

/** Sends signed-out visitors on private pages to the login screen. Role checks happen in each page. */
export async function middleware(request: NextRequest) {
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (userId) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/chat/:path*", "/account/:path*", "/listener/:path*", "/admin/:path*"],
};
