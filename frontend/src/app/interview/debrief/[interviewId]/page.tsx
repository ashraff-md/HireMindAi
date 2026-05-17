"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FeedbackDebriefView } from "@/components/feedback-debrief-view";
import { SessionRecordingPlayer } from "@/components/session-recording-player";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  feedbackRowToModel,
  fetchMyInterviewsWithFeedback,
  formatInterviewHistoryDate,
  type InterviewHistoryEntry,
} from "@/lib/interview-history";
import { downloadFeedbackPdf } from "@/lib/feedback-pdf";
import { cn } from "@/lib/utils";
import type { FeedbackTier } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

function tierForEntry(entry: InterviewHistoryEntry, plan: string): FeedbackTier {
  return entry.mode === "premium" || plan === "premium" ? "full" : "basic";
}

export default function DebriefPage() {
  const router = useRouter();
  const params = useParams();
  const interviewIdRaw = params.interviewId;
  const interviewId =
    typeof interviewIdRaw === "string"
      ? interviewIdRaw
      : Array.isArray(interviewIdRaw)
        ? interviewIdRaw[0]
        : "";

  const authReady = useAuthStore((s) => s.authReady);
  const plan = useAuthStore((s) => s.plan);

  const [entry, setEntry] = useState<InterviewHistoryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !interviewId) return;

    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchMyInterviewsWithFeedback();
        if (cancelled) return;
        const found = rows.find((r) => r.id === interviewId) ?? null;
        if (!found || !found.feedback) {
          setError(
            !found
              ? "Interview not found."
              : "Feedback is not ready yet for this session.",
          );
          setEntry(found);
          return;
        }
        setEntry(found);
        setError(null);
      } catch {
        if (!cancelled) {
          setError("Could not load interview.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, interviewId]);

  if (!authReady) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!interviewId) {
    router.replace("/history");
    return null;
  }

  if (error || !entry?.feedback) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6 py-16">
        <h1 className="font-display text-2xl font-semibold">Debrief unavailable</h1>
        <p className="text-muted-foreground">{error ?? "No data."}</p>
        <Link href="/history" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to history
        </Link>
      </div>
    );
  }

  const tier = tierForEntry(entry, plan);
  const model = feedbackRowToModel(entry.feedback, entry.score);
  const note =
    "Persisted scores and narrative from your completed cloud session.";

  return (
    <div>
      <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Session
          </p>
          <p className="font-display text-lg font-semibold">{entry.role}</p>
          <p className="text-sm text-muted-foreground">
            {formatInterviewHistoryDate(entry.created_at)} · {entry.mode} tier
          </p>
        </div>
        <Link
          href="/history"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          ← History
        </Link>
      </div>

      <FeedbackDebriefView
        feedback={{
          ...model,
          feedbackTier: tier,
        }}
        feedbackSourceNote={note}
        tier={tier}
        downloadSlot={
          tier === "full" ? (
            <Button
              type="button"
              variant="outline"
              className="hm-ring-glow w-full sm:w-auto"
              onClick={() =>
                downloadFeedbackPdf({
                  feedback: { ...model, feedbackTier: tier },
                  headline: `${entry.role} — HireMind debrief`,
                })
              }
            >
              Download report
            </Button>
          ) : null
        }
        recordingSlot={
          tier === "full" && plan === "premium" ? (
            <SessionRecordingPlayer interviewId={entry.id} />
          ) : null
        }
        footerExtra={
          <Button variant="ghost" onClick={() => router.push("/profile")}>
            Tune profile
          </Button>
        }
      />
    </div>
  );
}
