"use client";

import Link from "next/link";
import { History, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { displayNameFromEmail } from "@/lib/display-name";
import {
  fetchMyInterviewsWithFeedback,
  formatInterviewHistoryDate,
  type InterviewHistoryEntry,
} from "@/lib/interview-history";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function HeroWavesBg() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 opacity-[0.4]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="dashWave" x1="0%" x2="100%" y1="40%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.55 0.22 286 / 0.9)" />
          <stop offset="45%" stopColor="oklch(0.45 0.2 252 / 0.35)" />
          <stop offset="100%" stopColor="oklch(0.32 0.15 278 / 0.5)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#dashWave)"
        d="M0 156c124-82 296-132 466-118 168 13 358 134 594 146v126H0V156Z"
        className="translate-y-[20%]"
      />
      <path
        fill="url(#dashWave)"
        fillOpacity=".55"
        d="M0 210c206-108 394-174 596-154 206 21 394 174 596 174v154H0V210Z"
        className="translate-y-[8%]"
      />
    </svg>
  );
}

function DashboardEmptyHint({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/55 bg-background/75 p-6 text-center shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-black/35 md:p-8">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const plan = useAuthStore((s) => s.plan);
  const authReady = useAuthStore((s) => s.authReady);

  const [recent, setRecent] = useState<InterviewHistoryEntry[]>([]);

  const loadRecent = useCallback(async () => {
    if (plan !== "premium") {
      setRecent([]);
      return;
    }
    const rows = await fetchMyInterviewsWithFeedback();
    const withFeedback = rows.filter((r) => r.feedback);
    setRecent(withFeedback.slice(0, 3));
  }, [plan]);

  useEffect(() => {
    if (!authReady) return;
    const t = window.setTimeout(() => void loadRecent(), 0);
    return () => window.clearTimeout(t);
  }, [authReady, loadRecent]);

  const greetingName = displayNameFromEmail(email);
  const weekday = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const planBadge = plan === "premium" ? "Premium" : "Free";

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-8 pb-8 md:space-y-10 md:pb-12">
      <div className="pointer-events-none absolute inset-0 -mx-6 -my-10 -z-[1] rounded-[32px] bg-gradient-to-br from-sky-100/95 via-transparent to-violet-200/45 opacity-95 dark:hidden md:-mx-10" />

      {/* Top bar */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="rounded-full border-primary/35 bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
              {planBadge}
            </Badge>
            <span className="text-xs font-semibold capitalize tracking-[0.12em] text-muted-foreground">
              {weekday}
            </span>
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-[2.75rem]">
              Welcome back, {greetingName}.
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground md:text-lg">
              Start a practice session or open analytics when you have completed interviews to review.
            </p>
          </div>
        </div>
      </div>

      {/* Hero + metrics */}
      <section className="scroll-mt-28 grid gap-6 lg:grid-cols-[minmax(0,1.56fr)_minmax(260px,0.94fr)] lg:gap-8">
        <article className="relative overflow-hidden rounded-[1.85rem] border border-white/10 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 p-8 text-white shadow-xl dark:shadow-[0_48px_90px_-50px_oklch(0.4_0.25_286/0.6)] hm-panel-glow">
          <div className="hm-noise pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay" aria-hidden />
          <HeroWavesBg />
          <div className="relative z-[1] max-w-xl space-y-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Confidence arc</p>
            <div>
              <h2 className="font-display text-3xl font-semibold leading-snug md:text-[2rem]">
                Master your next technical interview with HireMind&nbsp;AI.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/76">
                Voice-led practice sessions with pacing and feedback tailored to your target role — so you show up calm
                and clear.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/interview/setup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 rounded-xl border-white/22 bg-gradient-to-r from-[#c084fc] to-[var(--hm-neon-to)] px-7 text-[#08080b] hover:opacity-[0.96]",
                )}
              >
                <Play className="size-[18px] fill-current opacity-95" aria-hidden />
                Start new interview
              </Link>
              <Link
                href="/#features"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Practice questions
              </Link>
            </div>
          </div>
        </article>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Performance pulse
          </p>
          {plan === "premium" && recent.length > 0 ? (
            <div className="space-y-3 rounded-2xl border border-white/55 bg-background/75 p-5 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-black/35">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent sessions
              </p>
              <ul className="space-y-3">
                {recent.map((r) => {
                  const f = r.feedback!;
                  const avg = Math.round(
                    (Number(f.communication_score) +
                      Number(f.technical_score) +
                      Number(f.confidence_score)) /
                      3,
                  );
                  return (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{r.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatInterviewHistoryDate(r.created_at)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 tabular-nums">
                        {avg}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/history"
                className="inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Full history →
              </Link>
            </div>
          ) : (
            <DashboardEmptyHint
              title="No performance data yet"
              body={
                plan === "premium"
                  ? "Complete an interview with feedback — your latest scores will show here."
                  : "Scores and skill breakdowns appear here for Premium members after cloud interviews with feedback."
              }
            />
          )}
        </div>
      </section>

      {/* Interview history shortcut */}
      <section className="scroll-mt-28 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Interview history</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse saved sessions with dates and roles — open details and analytics from the dedicated history tab.
            </p>
          </div>
          <Link
            href="/interview/setup"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-mr-2 text-muted-foreground hover:text-foreground")}
          >
            Start an interview →
          </Link>
        </div>

        <Link
          href="/history"
          className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card/55 p-6 shadow-sm transition-colors hover:border-primary/35 hover:bg-muted/40 md:flex-row md:items-center md:justify-between md:p-7"
        >
          <div className="flex items-start gap-4">
            <div
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--hm-neon-from)]/78 to-[var(--hm-neon-to)] text-primary-foreground shadow-md"
            >
              <History className="size-7 opacity-92" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-display text-lg font-semibold tracking-tight">Open history tab</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sessions you complete will appear in a chronological list once they are synced to your account.
              </p>
            </div>
          </div>
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 self-start rounded-xl md:self-center")}>
            View history →
          </span>
        </Link>
      </section>
    </div>
  );
}
