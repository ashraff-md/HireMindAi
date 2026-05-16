import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Allow browser calls from the frontend dev origin when APIs are requested cross-origin.
 * Prefer same-origin proxy from `frontend` rewrites in development.
 */
export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  const corsRaw = process.env.CORS_ORIGIN?.trim();
  const allowed = corsRaw
    ? corsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const devFallback =
    origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:")
      ? origin
      : null;

  const allowOrigin =
    (origin && allowed.includes(origin) ? origin : null) ?? devFallback;

  if (request.nextUrl.pathname.startsWith("/api") && request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (allowOrigin) {
      res.headers.set("Access-Control-Allow-Origin", allowOrigin);
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      res.headers.set("Access-Control-Max-Age", "86400");
    }
    return res;
  }

  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api") && allowOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowOrigin);
    response.headers.append("Vary", "Origin");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
