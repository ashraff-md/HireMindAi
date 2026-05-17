"use client";

import Link from "next/link";
import { BarChart3, Cpu } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { HmCard } from "@/components/hm-card";
import { LockedFeatureBadge } from "@/components/locked-feature-badge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  fetchMyInterviewsWithFeedback,
  formatInterviewHistoryDate,
  type FeedbackRow,
} from "@/lib/interview-history";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function avgTriplet(f: FeedbackRow) {
  return Math.round(
    (Number(f.communication_score) +
      Number(f.technical_score) +
      Number(f.confidence_score)) /
      3,
  );
}

export default function AnalyticsPage() {
  const authReady = useAuthStore((s) => s.authReady);
  const premium = useAuthStore((s) => s.plan) === "premium";
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<
    Array<{ id: string; created_at: string; feedback: FeedbackRow }>
  >([]);

  const load = useCallback(async () => {
    if (!premium) {
      setSessions([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchMyInterviewsWithFeedback();
      const withFb = rows
        .filter((r): r is typeof r & { feedback: FeedbackRow } => Boolean(r.feedback))
        .map((r) => ({
          id: r.id,
          created_at: r.created_at,
          feedback: r.feedback,
        }))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      setSessions(withFb);
    } finally {
      setLoading(false);
    }
  }, [premium]);

  useEffect(() => {
    if (!authReady) return;
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [authReady, load]);

  const trendData = useMemo(() => {
    return sessions.map((s, i) => ({
      n: i + 1,
      label: formatInterviewHistoryDate(s.created_at),
      composite: avgTriplet(s.feedback),
      communication: Math.round(Number(s.feedback.communication_score)),
      technical: Math.round(Number(s.feedback.technical_score)),
      confidence: Math.round(Number(s.feedback.confidence_score)),
    }));
  }, [sessions]);

  const averages = useMemo(() => {
    if (!sessions.length) return null;
    let c = 0;
    let t = 0;
    let f = 0;
    for (const s of sessions) {
      c += Number(s.feedback.communication_score);
      t += Number(s.feedback.technical_score);
      f += Number(s.feedback.confidence_score);
    }
    const n = sessions.length;
    return {
      count: n,
      communication: Math.round(c / n),
      technical: Math.round(t / n),
      confidence: Math.round(f / n),
      composite: Math.round(
        sessions.reduce((sum, s) => sum + avgTriplet(s.feedback), 0) / n,
      ),
    };
  }, [sessions]);

  const hasData = trendData.length > 0;

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
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]">
                Performance Insight
              </h1>
            </div>
            <p className="mt-3 max-w-[46rem] text-base text-muted-foreground md:text-lg">
              Score trends and dimension averages from interviews stored in your account. Fine-grained
              voice metrics (speaking pace, filler density) are not captured yet — planned for a future
              release.
            </p>
          </div>
        </div>
      </div>

      {!premium ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--hm-neon-from)]/35 bg-[var(--hm-neon-from)]/8 px-6 py-8">
          <LockedFeatureBadge className="absolute right-4 top-4" />
          <p className="font-display text-lg font-semibold tracking-tight">Premium analytics</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Upgrade to unlock score trends and rolling averages from your completed cloud sessions.
          </p>
          <Link href="/upgrade" className={cn(buttonVariants(), "mt-6 inline-flex rounded-xl")}>
            Upgrade
          </Link>
        </div>
      ) : loading ? (
        <p className="text-muted-foreground">Loading analytics…</p>
      ) : !hasData ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-dashed border-border/90 bg-muted/15 px-6 py-20 text-center md:py-24">
            <div
              aria-hidden
              className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground"
            >
              <BarChart3 className="size-9 opacity-80" />
            </div>
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              No scored sessions yet
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Finish a backend interview with feedback to see composite and per-dimension trends here.
            </p>
            <Link
              href="/interview/setup"
              className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex rounded-xl")}
            >
              Go to interview setup
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HmCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sessions
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {averages?.count ?? 0}
              </p>
            </HmCard>
            <HmCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Avg composite
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {averages?.composite ?? "—"}
              </p>
            </HmCard>
            <HmCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Avg communication
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {averages?.communication ?? "—"}
              </p>
            </HmCard>
            <HmCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Avg technical
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {averages?.technical ?? "—"}
              </p>
            </HmCard>
          </div>

          <HmCard className="gap-4 p-6">
            <CardHeader className="p-0">
              <CardTitle className="font-display text-lg">Score trend</CardTitle>
              <CardDescription>
                Composite score per completed session (chronological). Hover points for session time.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="n" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid oklch(0.35 0.05 285 / 0.4)",
                      }}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.label ?? "Session"
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="composite"
                      stroke="var(--hm-neon-from)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Composite"
                    />
                    <Line
                      type="monotone"
                      dataKey="communication"
                      stroke="oklch(0.55 0.15 250)"
                      strokeWidth={1.5}
                      dot={false}
                      name="Communication"
                    />
                    <Line
                      type="monotone"
                      dataKey="technical"
                      stroke="oklch(0.6 0.18 290)"
                      strokeWidth={1.5}
                      dot={false}
                      name="Technical"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </HmCard>
        </div>
      )}
    </div>
  );
}
