"use client";

import Link from "next/link";
import { Building2, Play, Zap } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { displayNameFromEmail } from "@/lib/display-name";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const CREDITS_DISPLAY = "1,240";

const METRICS = [
  {
    label: "Communication",
    value: 88,
    delta: "+4%",
    gradient: "from-teal-400 to-cyan-500",
    deltaTone: "text-teal-600 dark:text-teal-400",
  },
  {
    label: "Technical skills",
    value: 92,
    delta: "+12%",
    gradient: "from-purple-400 to-[var(--hm-neon-from)]",
    deltaTone: "text-purple-600 dark:text-purple-400",
  },
] as const;

const RECENT = [
  {
    id: "r1",
    role: "Senior Full-Stack Engineer",
    company: "Google",
    date: "June 22, 2026",
    duration: "28 min · Voice loop",
    score: 84,
  },
  {
    id: "r2",
    role: "Systems Architect",
    company: "Stripe",
    date: "June 18, 2026",
    duration: "32 min · Deep systems",
    score: 78,
  },
  {
    id: "r3",
    role: "Backend Engineer",
    company: "Cloudflare",
    date: "June 12, 2026",
    duration: "24 min · Go stack",
    score: 91,
  },
];

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

function MetricBars() {
  return (
    <div className="grid gap-4">
      {METRICS.map(({ label, value, delta, gradient, deltaTone }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/55 bg-background/75 p-4 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-black/35"
        >
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">{label}</span>
            <span className={cn("shrink-0 font-medium", deltaTone)}>{delta}</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted dark:bg-black/55">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out", gradient)}
              style={{ width: `${value}%` }}
            />
          </div>
          <p className="mt-4 text-right font-display text-xl font-semibold tabular-nums">
            <span className="text-foreground">{value}</span>
            <span className="text-muted-foreground">/100</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const plan = useAuthStore((s) => s.plan);

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
              Your AI readiness score has improved by 12% this week — personas, pacing, and debrief cues are now
              sharper on telemetry.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-primary/35 bg-[linear-gradient(110deg,var(--muted),transparent)] px-4 py-2.5 text-sm backdrop-blur-sm">
          <Zap className="size-[18px] text-amber-500" aria-hidden />
          <span className="font-semibold tracking-tight uppercase text-muted-foreground">AI credits · </span>
          <span className="font-display text-[15px] font-semibold">{CREDITS_DISPLAY} left</span>
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
                Personalized mock sessions with real-time sentiment overlays and sharper technical probes — calibrated
                to your target role ladder.
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Performance pulse</p>
          <MetricBars />
        </div>
      </section>

      {/* Recent interviews */}
      <section id="recent-interviews" className="scroll-mt-28 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Recent interviews</h2>
            <p className="mt-1 text-sm text-muted-foreground">Highest-signal rehearsals from your last onboarding cycle.</p>
          </div>
          <Link
            href="/dashboard#recent-interviews"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-mr-2 text-muted-foreground hover:text-foreground")}
          >
            View full history →
          </Link>
        </div>

        <ul className="space-y-3">
          {RECENT.map((row) => (
            <li
              key={row.id}
              className="grid gap-4 rounded-2xl border border-white/65 bg-background/90 p-5 shadow-[0_12px_40px_-32px_oklch(0.45_0.2_286/0.45)] backdrop-blur-md transition-colors hover:border-primary/35 dark:border-white/10 dark:bg-card/58 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6"
            >
              <div
                aria-hidden
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--hm-neon-from)]/88 to-[var(--hm-neon-to)] text-white shadow-lg shadow-purple-900/35"
              >
                <Building2 className="size-7 opacity-92" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-[17px] font-semibold leading-snug">{row.role}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.company} · <time dateTime={row.date}>{row.date}</time> · <span>{row.duration}</span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
                <p className="font-display text-2xl font-semibold tabular-nums">{row.score}%</p>
                <Button variant="outline" size="sm" disabled className="rounded-lg">
                  Replay coming soon
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
