import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import {
  bufferToWebReadableStream,
  loadInterviewRecordingFromSupabaseBuffer,
  openLocalInterviewRecordingStream,
} from "@/lib/interview-recording-fs";
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
      return NextResponse.json({ error: "invalid_interview_id" }, { status: 400 });
    }

    const token = parseBearer(request);
    if (!token) {
      return NextResponse.json({ error: "missing_bearer_token" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
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
      return NextResponse.json({ error: "interview_not_found" }, { status: 404 });
    }

    if (row.user_id !== user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
      return NextResponse.json({ error: "premium_required" }, { status: 403 });
    }

    const storedPath = row.user_recording_object_path?.trim();
    if (!storedPath) {
      return NextResponse.json({ error: "recording_not_found" }, { status: 404 });
    }

    const local = await openLocalInterviewRecordingStream(storedPath);
    if (local) {
      const webStream = Readable.toWeb(
        local.stream,
      ) as unknown as ReadableStream<Uint8Array>;
      return new NextResponse(webStream, {
        status: 200,
        headers: {
          "Content-Type": local.contentType,
          "Content-Length": String(local.size),
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    const remote = await loadInterviewRecordingFromSupabaseBuffer({
      objectPath: storedPath,
    });
    if (!remote) {
      return NextResponse.json({ error: "recording_not_found" }, { status: 404 });
    }

    return new NextResponse(bufferToWebReadableStream(remote.buffer), {
      status: 200,
      headers: {
        "Content-Type": remote.contentType,
        "Content-Length": String(remote.buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "recording_file_failed" }, { status: 500 });
  }
}
