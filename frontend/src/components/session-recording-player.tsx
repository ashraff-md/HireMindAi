"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchInterviewRecordingBlob } from "@/lib/recording-api";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

type Props = {
  interviewId: string;
};

export function SessionRecordingPlayer({ interviewId }: Props) {
  const userId = useAuthStore((s) => s.userId);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setUrl(null);
    revokeBlobUrl();

    if (!userId?.trim()) {
      setErr("Signed-in session required.");
      setLoading(false);
      return;
    }

    const sb = createSupabaseBrowserClient();
    if (!sb) {
      setErr("Signed-in session required.");
      setLoading(false);
      return;
    }
    const { data: sess } = await sb.auth.getSession();
    const tok = sess.session?.access_token;
    if (!tok) {
      setErr("Sign in to play this recording.");
      setLoading(false);
      return;
    }

    try {
      const blob = await fetchInterviewRecordingBlob({
        interviewId,
        accessToken: tok,
      });
      if (!blob || blob.size < 32) {
        setErr("No recording for this session.");
        setLoading(false);
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      blobUrlRef.current = objectUrl;
      setUrl(objectUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load audio";
      if (
        msg.includes("recording_not_found") ||
        msg.includes('"error":"recording_not_found"') ||
        msg.includes("404")
      ) {
        setErr("No recording for this session.");
      } else {
        setErr(msg);
      }
      setUrl(null);
    } finally {
      setLoading(false);
    }
  }, [interviewId, userId, revokeBlobUrl]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  useEffect(() => {
    return () => revokeBlobUrl();
  }, [revokeBlobUrl]);

  return (
    <div className="rounded-xl border border-white/10 bg-muted/20 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Your answers (audio)
      </p>
      {loading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading recording…</p>
      ) : err ? (
        <p className="mt-3 text-sm text-destructive">{err}</p>
      ) : url ? (
        <audio
          key={url}
          controls
          className="mt-4 w-full"
          src={url}
          preload="metadata"
        />
      ) : null}
      {!loading && url ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Audio is loaded from your workspace backend after upload.
        </p>
      ) : null}
    </div>
  );
}
