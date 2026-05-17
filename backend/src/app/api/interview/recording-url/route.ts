import { hiremindJson } from "@/lib/hiremind-response";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

export const runtime = "nodejs";

const UUID = z.string().uuid();

function parseBearer(request: Request): string | null {
  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const interviewIdRaw = url.searchParams.get("interviewId") ?? "";
    const interviewParsed = UUID.safeParse(interviewIdRaw);
    if (!interviewParsed.success) {
      return hiremindJson({ error: "invalid_interview_id" }, { status: 400 });
    }

    const token = parseBearer(request);
    if (!token) {
      return hiremindJson({ error: "missing_bearer_token" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return hiremindJson({ error: "invalid_token" }, { status: 401 });
    }

    const { data: interview, error: ivErr } = await supabase
      .from("interviews")
      .select("user_id, user_recording_object_path")
      .eq("id", interviewParsed.data)
      .maybeSingle();

    if (ivErr) {
      throw ivErr;
    }

    const row = interview as {
      user_id: string;
      user_recording_object_path: string | null;
    } | null;

    if (!row) {
      return hiremindJson({ error: "interview_not_found" }, { status: 404 });
    }

    if (row.user_id !== user.id) {
      return hiremindJson({ error: "forbidden" }, { status: 403 });
    }

    const { data: userRow, error: uErr } = await supabase
      .from("users")
      .select("plan_type")
      .eq("id", user.id)
      .maybeSingle();

    if (uErr) {
      throw uErr;
    }

    if ((userRow as { plan_type?: string } | null)?.plan_type !== "premium") {
      return hiremindJson({ error: "premium_required" }, { status: 403 });
    }

    const path = row.user_recording_object_path?.trim();
    if (!path) {
      return hiremindJson({ error: "recording_not_found" }, { status: 404 });
    }

    const ttl = 60 * 45;
    const { data: signed, error: signErr } = await supabase.storage
      .from("interview-audio")
      .createSignedUrl(path, ttl);

    if (signErr || !signed?.signedUrl) {
      throw signErr ?? new Error("signed_url_failed");
    }

    return hiremindJson({
      signedUrl: signed.signedUrl,
      expiresIn: ttl,
    });
  } catch (err) {
    console.error(err);
    return hiremindJson({ error: "recording_url_failed" }, { status: 500 });
  }
}
