import type { User } from "@supabase/supabase-js";

import { hiremindJson } from "@/lib/hiremind-response";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function requireBearerUser(
  request: Request,
): Promise<{ user: User } | Response> {
  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1]?.trim();

  if (!token) {
    return hiremindJson({ error: "missing_bearer_token" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return hiremindJson({ error: "invalid_token" }, { status: 401 });
  }

  return { user };
}

export async function requireBearerUserMatchesBody(
  request: Request,
  bodyUserId: string,
): Promise<Response | null> {
  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1]?.trim();

  if (!token) {
    return hiremindJson({ error: "missing_bearer_token" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return hiremindJson({ error: "invalid_token" }, { status: 401 });
  }

  if (user.id !== bodyUserId) {
    return hiremindJson({ error: "user_id_mismatch" }, { status: 403 });
  }

  return null;
}
