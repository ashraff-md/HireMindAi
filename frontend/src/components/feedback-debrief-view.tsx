"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
import type { FeedbackTier } from "@/lib/types";

export type DebriefFeedbackModel = {
  score: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedbackTier?: FeedbackTier;
  mock?: boolean;
  clientFallback?: boolean;
  serverError?: boolean;
  serverHint?: string;
};

type Props = {
  feedback: DebriefFeedbackModel;
  feedbackSourceNote: string;
  tier: FeedbackTier;
  downloadSlot?: React.ReactNode;
  recordingSlot?: React.ReactNode;
  footerExtra?: React.ReactNode;
};

export function FeedbackDebriefView({
  feedback,
  feedbackSourceNote,
  tier,
  downloadSlot,
  recordingSlot,
  footerExtra,
}: Props) {
  const isFull = tier === "full";

  const sections = isFull
    ? [
        { title: "Strengths", items: feedback.strengths },
        { title: "Growth areas", items: feedback.weaknesses },
        { title: "Next reps", items: feedback.suggestions },
      ]
    : [
        { title: "Strengths", items: feedback.strengths.slice(0, 3) },
        { title: "Suggestions", items: feedback.suggestions.slice(0, 2) },
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
            Composite score {feedback.score}/100
            {isFull
              ? " · synthesized from your full transcript."
              : " · free-tier summary — upgrade for deeper breakdowns."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end md:w-auto">
          {downloadSlot}
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

      {recordingSlot}

      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard
          label="Communication"
          score={feedback.communicationScore}
          delay={0}
        />
        {isFull ? (
          <>
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
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-muted/20 p-6 md:col-span-2">
            <p className="text-sm font-medium text-foreground">Overall pulse</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Detailed confidence and technical splits unlock on Premium alongside advanced analytics.
            </p>
          </div>
        )}
      </div>

      {isFull ? (
        <FeedbackPerformanceCharts
          score={feedback.score}
          communicationScore={feedback.communicationScore}
          confidenceScore={feedback.confidenceScore}
          technicalScore={feedback.technicalScore}
        />
      ) : null}

      <div
        className={cn(
          "grid gap-6",
          isFull ? "md:grid-cols-3" : "md:grid-cols-2",
        )}
      >
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
                <CardDescription>{feedbackSourceNote}</CardDescription>
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
        {footerExtra}
      </div>
    </div>
  );
}
