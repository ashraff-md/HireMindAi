"use client";

import Link from "next/link";
import { Building2, History, Mic2 } from "lucide-react";

import { LockedFeatureBadge } from "@/components/locked-feature-badge";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export type InterviewHistoryRow = {
  id: string;
  roleTitle: string;
  interviewType: string;
  startedAt: string;
  durationLabel: string;
  outcomeLabel?: string | null;
};

/** Replace with Supabase/API when interview runs are persisted. */
function getInterviewHistory(): InterviewHistoryRow[] {
  return [];
}

function formatHeadingDate(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default function InterviewHistoryPage() {
  const rows = getInterviewHistory();
  const hasRows = rows.length > 0;
  const today = formatHeadingDate(new Date());
  const premium = useAuthStore((s) => s.plan) === "premium";

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-10 pb-12 md:space-y-12 md:pb-16">
      <div className="pointer-events-none absolute inset-0 -mx-6 -my-10 -z-[1] rounded-[32px] bg-gradient-to-br from-violet-100/85 via-transparent to-cyan-100/40 opacity-95 dark:hidden md:-mx-10" />

      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Dashboard
        </Link>

        <div className="flex flex-col gap-6 border-b border-border/80 pb-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-primary/35 bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              >
                Log
              </Badge>
              <span className="text-xs font-semibold capitalize tracking-[0.12em] text-muted-foreground">{today}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-sidebar-border bg-sidebar-accent/50 text-primary">
                <History className="size-7" aria-hidden strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Interview history</h1>
                <p className="mt-2 max-w-[42rem] text-sm text-muted-foreground md:text-base">
                  Completed and in-progress rehearsals stay in one place. Open a row for details once replay and exports
                  are available.
                </p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
            <Link
              href="/analytics"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
            >
              Analytics
            </Link>
            <Link
              href="/interview/setup"
              className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-2 rounded-xl")}
            >
              <Mic2 className="size-4 opacity-90" aria-hidden />
              New interview
            </Link>
          </div>
        </div>
      </div>

      {hasRows ? (
        <div className="-mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>All sessions</span>
          <span className="text-border">·</span>
          <span className="text-muted-foreground/70">Newest first</span>
        </div>
      ) : null}

      {!hasRows ? (
        <div className="rounded-2xl border border-dashed border-border/90 bg-muted/15 px-6 py-20 text-center md:py-24">
          <div
            aria-hidden
            className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground"
          >
            <Building2 className="size-9 opacity-80" />
          </div>
          <p className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">No sessions yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {premium
              ? "Nothing in your history yet — complete an interview with feedback to see it listed here."
              : "Session history and progress tracking are a Premium perk — start practicing now, then upgrade to review past runs side by side."}
          </p>
          {!premium ? (
            <div className="mt-6 flex justify-center">
              <LockedFeatureBadge />
            </div>
          ) : null}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/interview/setup"
              className={cn(buttonVariants(), "rounded-xl")}
            >
              Go to interview setup
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground",
              )}
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/40 shadow-xl backdrop-blur-md dark:bg-black/40">
          <div className="border-b border-border/80 px-5 py-4 md:px-6">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Sessions
            </h2>
          </div>
          <ul className="divide-y divide-border/60">
            {rows.map((row) => (
              <li
                key={row.id}
                className="grid gap-4 px-5 py-5 transition-colors hover:bg-muted/30 md:grid-cols-[1fr_auto] md:items-center md:px-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-[17px] font-semibold leading-snug text-foreground">{row.roleTitle}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span>{row.interviewType}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={row.startedAt}>{row.startedAt}</time>
                    <span aria-hidden>·</span>
                    <span>{row.durationLabel}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  {row.outcomeLabel ? (
                    <Badge variant="secondary" className="rounded-lg font-normal tabular-nums">
                      {row.outcomeLabel}
                    </Badge>
                  ) : null}
                  <Button variant="outline" size="sm" className="rounded-lg" disabled>
                    Open details
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {premium
          ? "Interview history syncs with your account after each completed session."
          : "Upgrade to Premium to unlock persistent interview history and trends."}
      </p>
    </div>
  );
}
