import { hiremindJson } from "@/lib/hiremind-response";
import {
  saveInterviewRecordingFile,
} from "@/lib/interview-recording-fs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireBearerUserMatchesBody } from "@/lib/supabase-auth";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const FormSchema = z.object({
  userId: z.string().uuid(),
  interviewId: z.string().uuid(),
});

const ALLOWED_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "video/webm",
]);

function extensionForMime(mime: string): string {
  const m = mime.toLowerCase().split(";")[0]?.trim() ?? "";
  if (m === "audio/mp4" || m === "video/mp4") return "m4a";
  if (m === "audio/mpeg") return "mp3";
  if (m === "audio/wav") return "wav";
  return "webm";
}

async function assertPremiumOwnsInterview(
  userId: string,
  interviewId: string,
): Promise<Response | null> {
  const supabase = getSupabaseAdmin();

  const { data: interview, error: ivErr } = await supabase
    .from("interviews")
    .select("user_id")
    .eq("id", interviewId)
    .maybeSingle();

  if (ivErr) {
    throw ivErr;
  }

  if (!interview) {
    return hiremindJson({ error: "interview_not_found" }, { status: 404 });
  }

  if ((interview as { user_id: string }).user_id !== userId) {
    return hiremindJson({ error: "forbidden" }, { status: 403 });
  }

  const { data: userRow, error: uErr } = await supabase
    .from("users")
    .select("plan_type")
    .eq("id", userId)
    .maybeSingle();

  if (uErr) {
    throw uErr;
  }

  const pt = (userRow as { plan_type?: string } | null)?.plan_type;
  if (pt !== "premium") {
    return hiremindJson({ error: "premium_required" }, { status: 403 });
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const userIdRaw = form.get("userId");
    const interviewIdRaw = form.get("interviewId");
    const file = form.get("audio");

    const parsed = FormSchema.safeParse({
      userId: typeof userIdRaw === "string" ? userIdRaw : "",
      interviewId: typeof interviewIdRaw === "string" ? interviewIdRaw : "",
    });

    if (!parsed.success) {
      return hiremindJson(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const authDeny = await requireBearerUserMatchesBody(
      request,
      parsed.data.userId,
    );
    if (authDeny) {
      return authDeny;
    }

    const deny = await assertPremiumOwnsInterview(
      parsed.data.userId,
      parsed.data.interviewId,
    );
    if (deny) {
      return deny;
    }

    if (!(file instanceof File) || file.size < 32) {
      return hiremindJson({ error: "audio_required" }, { status: 400 });
    }

    const mime = (file.type || "audio/webm").toLowerCase();
    const baseMime = mime.split(";")[0]?.trim() ?? "";
    if (!ALLOWED_TYPES.has(baseMime)) {
      return hiremindJson(
        { error: "unsupported_audio_type", received: mime },
        { status: 415 },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = extensionForMime(baseMime);
    const objectPath = await saveInterviewRecordingFile({
      userId: parsed.data.userId,
      interviewId: parsed.data.interviewId,
      ext,
      buffer: buf,
    });

    const supabase = getSupabaseAdmin();
    const { error: updErr } = await supabase
      .from("interviews")
      .update({
        user_recording_object_path: objectPath,
      })
      .eq("id", parsed.data.interviewId)
      .eq("user_id", parsed.data.userId);

    if (updErr) {
      throw updErr;
    }

    return hiremindJson({ objectPath });
  } catch (err) {
    console.error(err);
    return hiremindJson({ error: "recording_upload_failed" }, { status: 500 });
  }
}
