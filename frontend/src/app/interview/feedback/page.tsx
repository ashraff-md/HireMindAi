"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FeedbackPerformanceCharts } from "@/components/feedback-performance-chart";
import { HmCard } from "@/components/hm-card";
import { ScoreCard } from "@/components/score-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useInterviewStore } from "@/stores/interview-store";

export default function FeedbackPage() {
  const router = useRouter();
  const feedback = useInterviewStore((s) => s.feedback);
  const [downloadNote, setDownloadNote] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) {
      router.replace("/dashboard");
    }
  }, [feedback, router]);

  if (!feedback) {
    return null;
  }

  const sections = [
    { title: "Strengths", items: feedback.strengths },
    { title: "Growth areas", items: feedback.weaknesses },
    { title: "Next reps", items: feedback.suggestions },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Interview debrief
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Performance pulse
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Composite score {feedback.score}/100 · synthesized from your latest
            transcript window.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end md:w-auto">
          <Button
            type="button"
            variant="outline"
            className="hm-ring-glow w-full sm:w-auto"
            onClick={() =>
              setDownloadNote(
                "PDF export ships soon — use Print snapshot for a paper-ready layout.",
              )
            }
          >
            Download report
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => window.print()}
          >
            Print snapshot
          </Button>
          <Link
            href="/interview/setup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full text-center sm:w-auto",
            )}
          >
            Start new interview
          </Link>
        </div>
      </div>

      {downloadNote ? (
        <p
          className="rounded-xl border border-[var(--hm-neon-from)]/25 bg-[var(--hm-neon-from)]/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          {downloadNote}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard
          label="Communication"
          score={feedback.communicationScore}
          delay={0}
        />
        <ScoreCard
          label="Confidence"
          score={feedback.confidenceScore}
          delay={0.08}
        />
        <ScoreCard
          label="Technical"
          score={feedback.technicalScore}
          delay={0.16}
        />
      </div>

      <FeedbackPerformanceCharts
        score={feedback.score}
        communicationScore={feedback.communicationScore}
        confidenceScore={feedback.confidenceScore}
        technicalScore={feedback.technicalScore}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((block, idx) => (
          <motion.div
            key={block.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.06 }}
          >
            <HmCard className="h-full gap-4 p-5">
              <CardHeader className="p-0">
                <CardTitle className="text-base">{block.title}</CardTitle>
                <CardDescription>
                  Generated {feedback.mock ? "locally (mock)" : "via backend"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-white/10 bg-white/30 px-3 py-2 dark:bg-black/30"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </HmCard>
          </motion.div>
        ))}
      </div>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to dashboard
        </Link>
        <Button variant="ghost" onClick={() => router.push("/profile")}>
          Tune profile
        </Button>
      </div>
    </div>
  );
}
