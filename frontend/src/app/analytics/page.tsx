"use client";

import Link from "next/link";
import { BarChart3, Cpu } from "lucide-react";

import { LockedFeatureBadge } from "@/components/locked-feature-badge";

import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

/** Replace with persisted interview aggregates when backend is wired. */
function getAnalyticsOverview(): Record<string, unknown> | null {
  return null;
}

export default function AnalyticsPage() {
  const analyticsData = getAnalyticsOverview();
  const hasData = analyticsData !== null && Object.keys(analyticsData).length > 0;
  const premium = useAuthStore((s) => s.plan) === "premium";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-20 md:space-y-11 md:pb-24">
      <div className="flex flex-col gap-8 border-b border-white/90 pb-8 dark:border-white/10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-5">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Dashboard
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <Cpu className="size-11 text-[var(--hm-neon-from)] opacity-92" aria-hidden />
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]">Performance Insight</h1>
            </div>
            <p className="mt-3 max-w-[46rem] text-base text-muted-foreground md:text-lg">
              Aggregates from completed interviews appear here once data is connected.
              {!premium ? " Advanced pacing, filler cues, and hesitation signals preview on Premium." : null}
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="space-y-6">
          {!premium ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--hm-neon-from)]/35 bg-[var(--hm-neon-from)]/8 px-6 py-8">
              <LockedFeatureBadge className="absolute right-4 top-4" />
              <p className="font-display text-lg font-semibold tracking-tight">Premium analytics preview</p>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Speaking pace, filler density, and confidence trends unlock with Premium once your sessions are connected
                to analytics pipelines.
              </p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-dashed border-border/90 bg-muted/15 px-6 py-20 text-center md:py-24">
          <div
            aria-hidden
            className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground"
          >
            <BarChart3 className="size-9 opacity-80" />
          </div>
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground">No data</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Finish a practice interview with feedback to populate analytics.
          </p>
          <Link
            href="/interview/setup"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex rounded-xl")}
          >
            Go to interview setup
          </Link>
        </div>
        </div>
      ) : null}
    </div>
  );
}
