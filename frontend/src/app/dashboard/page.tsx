"use client";

import Link from "next/link";

import { HmCard } from "@/components/hm-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const HISTORY = [
  { id: "h1", role: "Senior Frontend Engineer", duration: "24m · Behavioral arc", score: 83 },
  { id: "h2", role: "ML Platform Engineer", duration: "19m · Stress persona", score: 76 },
  { id: "h3", role: "Product Engineer", duration: "21m · Founder persona", score: 71 },
];

const SPARK_WEEKS = [
  [42, 58, 52, 61, 57, 63, 68],
  [48, 52, 49, 56, 60, 62, 74],
];

function Spark({ points }: { points: number[] }) {
  const max = Math.max(...points, 1);
  return (
    <div className="flex h-14 items-end gap-px">
      {points.map((p, i) => (
        <div
          key={i}
          className="w-2 rounded-sm bg-gradient-to-t from-[var(--hm-neon-from)] via-[var(--hm-neon-via)] to-[var(--hm-neon-to)] opacity-70"
          style={{ height: `${8 + (p / max) * 46}px` }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const plan = useAuthStore((s) => s.plan);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--hm-neon-from)]">
            Welcome back
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-[2.85rem]">
            Mission control
          </h1>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            {email ? (
              <>
                Signed in as <span className="text-foreground">{email}</span>. Dial-in personas,
                spectral waveform HUD, and scoring telemetry sync below.
              </>
            ) : (
              <>Browsing as guest — analytics tiles showcase mocked rehearsal telemetry.</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="rounded-full px-4 py-2 uppercase tracking-[0.18em]">
            Plan · {plan}
          </Badge>
          <Link href="/interview/setup" className={cn(buttonVariants({ size: "lg" }), "rounded-2xl px-8")}>
            Start new interview
          </Link>
        </div>
      </div>

      <section id="analytics" className="scroll-mt-28 grid gap-5 lg:grid-cols-3">
        <HmCard className="gap-4 border-white/15 bg-card/65 p-6 lg:col-span-2">
          <CardHeader className="p-0">
            <CardTitle className="font-display text-xl">Performance telemetry</CardTitle>
            <CardDescription>
              Lightweight rehearsal deltas until Supabase histories sync client-side charts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-0 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl dark:bg-black/45">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>Confidence pulse</span>
                <span className="text-foreground">+12%</span>
              </div>
              <Spark points={SPARK_WEEKS[0] ?? []} />
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl dark:bg-black/45">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>Signal clarity</span>
                <span className="text-foreground">Stabilizing</span>
              </div>
              <Spark points={SPARK_WEEKS[1] ?? []} />
            </div>
          </CardContent>
        </HmCard>

        <HmCard className="gap-4 border-[var(--hm-neon-from)]/35 bg-gradient-to-br from-[var(--hm-neon-from)]/18 via-transparent to-transparent p-6 hm-panel-glow">
          <CardHeader className="p-0">
            <CardTitle className="font-display text-xl">Heat checklist</CardTitle>
            <CardDescription>Rapid-fire reminders before jumping back into voice session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-0 text-sm text-muted-foreground">
            <p>✓ Outline STAR payloads for past launches.</p>
            <p>✓ Prep metrics that survived exec scrutiny.</p>
            <p>✓ Align persona difficulty with onsite panel tone.</p>
          </CardContent>
        </HmCard>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Previous interviews</h2>
            <p className="text-sm text-muted-foreground">
              Snapshot cards mirror eventual Supabase pulls — swap API hooks when ready.
            </p>
          </div>
          <Link href="/profile" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}>
            Tune profile
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {HISTORY.map((row) => (
            <HmCard key={row.id} className="gap-4 border-white/15 bg-card/65 p-6 backdrop-blur-2xl">
              <CardHeader className="p-0">
                <CardTitle className="font-display text-lg">{row.role}</CardTitle>
                <CardDescription>{row.duration}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between p-0">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Composite</p>
                  <p className="font-display text-3xl font-semibold">{row.score}</p>
                </div>
                <Button variant="outline" size="sm" disabled className="rounded-xl">
                  Replay soon
                </Button>
              </CardContent>
            </HmCard>
          ))}
        </div>
      </section>
    </div>
  );
}
