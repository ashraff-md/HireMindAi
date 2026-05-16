"use client";

import Link from "next/link";
import { Activity, ArrowDownTray, Cpu, Gauge, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CORE_METRICS = [
  {
    label: "Communication Score",
    value: 94,
    barClass: "from-purple-400 to-[var(--hm-neon-from)]",
    trackClass: "bg-purple-950/45",
  },
  {
    label: "Technical Proficiency",
    value: 78,
    barClass: "from-cyan-400 to-sky-500",
    trackClass: "bg-cyan-950/48",
  },
  {
    label: "Confidence & Presence",
    value: 88,
    barClass: "from-indigo-300 to-sky-400",
    trackClass: "bg-indigo-950/52",
  },
] as const;

const STRENGTHS = [
  "Clear articulation of distributed system resilience trade-offs alongside pragmatic guardrails.",
  "Empathic listener — reformulates panel pushback calmly without losing directional intent.",
  "Strong signal-to-noise on technical jargon; aligns vocabulary with interviewer seniority.",
];

const IMPROVE = [
  "Add more granularity when describing failure-mode blast radius containment paths.",
  "Proactively surface clarifying checkpoints before proposing architecture pivots.",
];

function InsightCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.085] bg-zinc-950/65 p-7 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/55",
        className,
      )}
    >
      {title ? <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h3> : null}
      {children}
    </div>
  );
}

function ScoreGauge({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value)) / 100;
  const dash = c * pct;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative mx-auto w-44 md:w-[13.25rem]">
        <svg viewBox="0 0 140 140" className="aspect-square w-full max-w-none" aria-hidden>
          <defs>
            <linearGradient id="hmScoreRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="55%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={r} fill="none" className="stroke-white/[0.08]" strokeWidth="11" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="url(#hmScoreRing)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8 text-center">
          <span className="font-display text-4xl font-bold tabular-nums leading-none">{value}</span>
          <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            OUT OF <span className="text-foreground">100</span>
          </span>
        </div>
      </div>

      <span className="mt-10 font-semibold uppercase tracking-[0.24em] text-cyan-400">Strong Fit</span>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
        Candidate exceeds technical thresholds with exceptional soft skills alignment.
      </p>
    </div>
  );
}

function TechnicalDeepDiveMap() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/38 bg-black/92 p-8 shadow-[inset_0_0_60px_-12px_rgba(103,249,239,0.12)] md:p-9">
      <div
        aria-hidden
        className="pointer-events-none absolute left-8 top-[36%] size-[120%] -translate-x-1/4 rounded-full border border-purple-400/36 opacity-52"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,white_0_1px,transparent_1px_18px)] opacity-[0.07]"
      />

      <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-cyan-500/94">
        TECHNICAL DEEP-DIVE MAP
      </p>
      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">Skill correlation heatmap</h3>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Multi-axis overlays show how recruiter probes cluster across infra, languages, and system design arcs for this profile.
      </p>

      <div className="mt-10 flex flex-wrap gap-6 pb-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span className="inline-flex items-center gap-3 text-purple-400">
          <span className="inline-block size-2.5 rounded-full bg-purple-400 shadow-[0_0_14px_rgb(216,166,247)]" />
          Kubernetes
        </span>
        <span className="inline-flex items-center gap-3 text-cyan-400">
          <span className="inline-block size-2.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgb(103,249,239)]" />
          Rust/C++
        </span>
        <span className="inline-flex items-center gap-3 text-sky-300">
          <span className="inline-block size-2.5 rounded-full bg-sky-400 shadow-[0_0_14px_rgb(125,211,252)]" />
          System design
        </span>
      </div>

      <svg
        viewBox="0 0 860 268"
        className="relative z-[1] h-auto w-full"
        aria-label="Correlation chart for Kubernetes, Rust, and System design competency across interview phases."
        role="img"
      >
        <defs>
          <linearGradient id="fillK8" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(192,132,252)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(15,23,42)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fillRust" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(103,246,238)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(15,23,42)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 52, 104, 156, 208].map((y) => (
          <line
            key={`g-${y}`}
            x1="0"
            y1={53 + y}
            x2="860"
            y2={53 + y}
            className="stroke-white/[0.07]"
            strokeWidth="1"
          />
        ))}

        <path
          fill="url(#fillK8)"
          d="M0 238 L143 206 L284 217 L427 174 L569 218 L716 172 L860 212 L860 266 L0 266 Z"
        />
        <path
          fill="none"
          className="stroke-purple-400/95"
          strokeWidth="3"
          d="M0 238 Q 160 248 287 227 T 569 219 T 860 218"
        />

        <path
          fill="url(#fillRust)"
          d="M0 255 L154 268 L294 268 L447 268 L579 266 L734 267 L860 268 L860 269 L0 269 Z"
        />
        <path
          fill="none"
          className="stroke-cyan-400/95"
          strokeWidth="2.5"
          d="M0 252 L165 266 L294 263 L446 267 L579 265 L734 267 L860 268"
        />

        <path
          fill="none"
          className="stroke-sky-400/95"
          strokeWidth="2.5"
          d="M0 224 L173 239 L294 214 L446 229 L579 237 L734 229 L856 239"
          strokeDasharray="7 11"
        />
      </svg>
    </div>
  );
}

export default function AnalyticsPage() {
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
              Detailed analysis for Candidate&nbsp;ID:&nbsp;<span className="font-semibold tabular-nums text-foreground">#8812</span>
              {" — "}
              <span>Senior Systems Engineer</span>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          className="shrink-0 gap-3 rounded-xl border-white/72 bg-muted/72 px-6 py-7 text-[15px] font-semibold dark:border-white/25 dark:bg-zinc-900/94"
          disabled
        >
          <ArrowDownTray className="size-[18px] opacity-90" aria-hidden />
          Download full report
          <span className="sr-only">(soon)</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.94fr)_minmax(280px,1.06fr)] lg:gap-8">
        <InsightCard title="Overall HireMind score" className="flex flex-col">
          <div className="mt-8 pb-10">
            <ScoreGauge value={82} />
          </div>
        </InsightCard>

        <InsightCard title="Core metrics">
          <div className="mt-7 space-y-8">
            {CORE_METRICS.map(({ label, value, barClass, trackClass }) => (
              <div key={label} className="space-y-2.5">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{label}</span>
                  <span className="tabular-nums text-muted-foreground">{value}%</span>
                </div>
                <div className={cn("h-2.5 overflow-hidden rounded-full bg-muted", trackClass)}>
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r", barClass)}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </InsightCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InsightCard className="p-8">
          <div className="flex items-start gap-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/53 bg-purple-950/73 text-purple-200">
              <Gauge className="size-7" aria-hidden strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Response latency</p>
              <p className="mt-3 font-display text-5xl font-semibold tabular-nums leading-none">1.2s</p>
              <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">Measured from interviewer speech stop to candidate waveform lift.</p>
            </div>
          </div>
        </InsightCard>
        <InsightCard className="p-8">
          <div className="flex items-start gap-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/48 bg-cyan-950/70 text-cyan-200">
              <Activity className="size-7" aria-hidden strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sentiment trend</p>
              <p className="mt-3 font-display text-[2rem] font-semibold text-cyan-400">Stable</p>
              <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">No escalation spikes detected across probing intervals.</p>
            </div>
          </div>
        </InsightCard>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <div className="rounded-2xl border border-cyan-500/62 bg-black/73 p-7 shadow-xl backdrop-blur-xl dark:bg-zinc-950/66 md:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-cyan-400/95" strokeWidth={1.95} aria-hidden />
            <h3 className="font-display text-lg font-semibold tracking-tight">Key strengths</h3>
          </div>
          <ul className="mt-10 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            {STRENGTHS.map((t) => (
              <li key={t.slice(0, 24)} className="flex gap-5">
                <span className="font-display text-purple-400" aria-hidden>
                  ●
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-orange-500/58 bg-orange-950/18 p-7 shadow-xl backdrop-blur-xl dark:bg-black/73 md:p-8">
          <div className="flex items-start gap-3">
            <Gauge className="mt-1 size-6 shrink-0 text-orange-400" aria-hidden strokeWidth={1.9} />
            <h3 className="font-display text-lg font-semibold tracking-tight">Development areas</h3>
          </div>
          <ul className="mt-10 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            {IMPROVE.map((t) => (
              <li key={t.slice(0, 24)} className="flex gap-5">
                <span className="font-display text-orange-400/95" aria-hidden>
                  ●
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TechnicalDeepDiveMap />

      <p className="text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        HireMind analytics are illustrative until Supabase session archives sync.
      </p>
      <Link
        href="/interview/setup"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mx-auto flex w-full max-w-sm justify-center rounded-2xl border-0 bg-gradient-to-r from-[var(--hm-neon-from)] to-[var(--hm-neon-to)] text-primary-foreground shadow-[0_0_48px_-18px_var(--hm-glow-mid)]",
        )}
      >
        Launch another rehearsal
      </Link>
    </div>
  );
}
