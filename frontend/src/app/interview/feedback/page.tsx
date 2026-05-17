"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FeedbackDebriefView } from "@/components/feedback-debrief-view";
import { Button } from "@/components/ui/button";
import { downloadFeedbackPdf } from "@/lib/feedback-pdf";
import type { FeedbackTier } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useInterviewStore } from "@/stores/interview-store";

export default function FeedbackPage() {
  const router = useRouter();
  const feedback = useInterviewStore((s) => s.feedback);
  const plan = useAuthStore((s) => s.plan);
  const [downloadNote, setDownloadNote] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) {
      router.replace("/dashboard");
    }
  }, [feedback, router]);

  if (!feedback) {
    return null;
  }

  const tier: FeedbackTier =
    feedback.feedbackTier ?? (plan === "premium" ? "full" : "basic");
  const isFull = tier === "full";

  const feedbackSourceNote = feedback.serverError
    ? feedback.serverHint?.trim()
      ? feedback.serverHint.trim()
      : "Practice summary (feedback API returned a server error — check backend logs, Supabase migrations, and env)."
    : feedback.clientFallback
      ? "Practice summary (interview API was unreachable — check that the backend is running and NEXT_PUBLIC_API_URL matches)."
      : feedback.mock
        ? "Estimated from the offline evaluator — add Gemini and Supabase env vars on the backend for live scoring."
        : "From your cloud interview session.";

  return (
    <>
      {downloadNote ? (
        <div className="mx-auto mb-4 max-w-6xl">
          <p
            className="rounded-xl border border-[var(--hm-neon-from)]/25 bg-[var(--hm-neon-from)]/10 px-4 py-3 text-sm text-foreground"
            role="status"
          >
            {downloadNote}
          </p>
        </div>
      ) : null}

      <FeedbackDebriefView
        feedback={feedback}
        feedbackSourceNote={feedbackSourceNote}
        tier={tier}
        downloadSlot={
          <Button
            type="button"
            variant="outline"
            className="hm-ring-glow w-full sm:w-auto"
            onClick={() => {
              if (plan === "premium" && isFull) {
                downloadFeedbackPdf({ feedback });
                return;
              }
              setDownloadNote(
                "PDF export with full breakdown is a Premium feature — upgrade or use Print snapshot.",
              );
            }}
          >
            Download report
          </Button>
        }
        footerExtra={
          <Button variant="ghost" onClick={() => router.push("/profile")}>
            Tune profile
          </Button>
        }
      />
    </>
  );
}
