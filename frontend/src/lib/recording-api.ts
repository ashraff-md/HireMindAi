"use client";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

export async function uploadInterviewRecordingAudio(args: {
  userId: string;
  interviewId: string;
  accessToken: string;
  blob: Blob;
  filename?: string;
}): Promise<{ objectPath: string }> {
  const base = apiBase();
  const url = base ? `${base}/api/interview/recording` : "/api/interview/recording";

  const form = new FormData();
  form.set("userId", args.userId);
  form.set("interviewId", args.interviewId);
  const name = args.filename ?? "session.webm";
  form.set("audio", args.blob, name);

  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${args.accessToken}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = text || `Upload failed (${res.status})`;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error === "premium_required") msg = "Premium required.";
      else if (typeof j.error === "string" && j.error) msg = j.error;
    } catch {
      /* */
    }
    throw new Error(msg);
  }

  return (await res.json()) as { objectPath: string };
}

export async function fetchInterviewRecordingBlob(args: {
  interviewId: string;
  accessToken: string;
}): Promise<Blob> {
  const base = apiBase();
  const path = `/api/interview/recording-file?interviewId=${encodeURIComponent(args.interviewId)}`;
  const url = base ? `${base}${path}` : path;

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${args.accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Recording fetch failed (${res.status})`);
  }

  return res.blob();
}

/** Legacy: Supabase signed URL when recordings lived only in object storage. */
export async function fetchInterviewRecordingSignedUrl(args: {
  interviewId: string;
  accessToken: string;
}): Promise<{ signedUrl: string; expiresIn: number }> {
  const base = apiBase();
  const path = `/api/interview/recording-url?interviewId=${encodeURIComponent(args.interviewId)}`;
  const url = base ? `${base}${path}` : path;

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${args.accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Recording URL failed (${res.status})`);
  }

  return (await res.json()) as { signedUrl: string; expiresIn: number };
}
