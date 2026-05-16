import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { sanitizeInternalReturnPath } from "@/lib/sanitize-internal-path";

/** Route prefixes that require a verified Supabase user when credentials are configured. */
const AUTH_REQUIRED_PREFIXES = ["/analytics"] as const;

function supabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return { url, key };
}

export async function middleware(request: NextRequest) {
  const needsAuth = AUTH_REQUIRED_PREFIXES.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );
  if (!needsAuth) {
    return NextResponse.next({ request });
  }

  const { url, key } = supabaseCredentials();
  // Without Supabase, match client behavior (guest/demo); no cookie gate possible.
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    const destination = sanitizeInternalReturnPath(request.nextUrl.pathname) ?? "/analytics";
    login.searchParams.set("next", destination);
    return NextResponse.redirect(login);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/analytics", "/analytics/:path*"],
};
