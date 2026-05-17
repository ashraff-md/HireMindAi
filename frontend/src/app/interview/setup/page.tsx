"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Play, Search, Smile, Zap } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { LockedFeatureBadge } from "@/components/locked-feature-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DIFFICULTIES,
  INTERVIEW_PERSONALITIES,
  JOB_ROLES,
  PRESET_JOB_CHIPS,
  difficultyById,
  personalityById,
  type PersonalityId,
} from "@/lib/interview-options";
import {
  fetchInterviewMonthlyUsage,
  type InterviewMonthlyUsage,
} from "@/lib/interview-monthly-usage";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useInterviewStore } from "@/stores/interview-store";

const PERSONA_ICONS = {
  corporate_hr: Briefcase,
  friendly: Smile,
  stress: Zap,
} satisfies Record<PersonalityId, typeof Briefcase>;

function MiniStatBar({
  label,
  valuePct,
}: {
  label: string;
  valuePct: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{valuePct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/55 dark:bg-white/12">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--hm-neon-from)] to-purple-600"
          style={{ width: `${Math.min(100, valuePct)}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewSetupPage() {
  const router = useRouter();
  const plan = useAuthStore((s) => s.plan);
  const authReady = useAuthStore((s) => s.authReady);
  const userId = useAuthStore((s) => s.userId);
  const premium = plan === "premium";
  const resetSession = useInterviewStore((s) => s.resetSession);
  const setMeta = useInterviewStore((s) => s.setMeta);

  const defaultRole =
    JOB_ROLES.find((r) => r === "Product Manager") ?? JOB_ROLES[0] ?? "Product Manager";

  const [role, setRole] = useState<string>(defaultRole);
  const [personalityId, setPersonalityId] = useState<PersonalityId>(
    INTERVIEW_PERSONALITIES[0]?.id ?? "corporate_hr",
  );
  const [difficultyId, setDifficultyId] = useState<string>(
    DIFFICULTIES.find((d) => d.id === "mid")?.id ?? "mid",
  );

  const personality = personalityById(personalityId);
  const difficulty = difficultyById(difficultyId);

  useEffect(() => {
    if (!premium && personalityId !== "corporate_hr") {
      setPersonalityId(INTERVIEW_PERSONALITIES[0]?.id ?? "corporate_hr");
    }
  }, [premium, personalityId]);

  const [monthlyUsage, setMonthlyUsage] = useState<InterviewMonthlyUsage | null>(null);

  useEffect(() => {
    if (!authReady || premium || !userId) {
      setMonthlyUsage(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const u = await fetchInterviewMonthlyUsage();
      if (!cancelled) {
        setMonthlyUsage(u);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, premium, userId]);

  const freeMonthBlocked =
    !premium &&
    monthlyUsage != null &&
    monthlyUsage.plan === "free" &&
    monthlyUsage.remainingFreeThisMonth !== null &&
    monthlyUsage.remainingFreeThisMonth <= 0;

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  function handleStart() {
    if (freeMonthBlocked) {
      return;
    }
    const effectivePersonality: PersonalityId =
      premium ? personalityId : INTERVIEW_PERSONALITIES[0]?.id ?? "corporate_hr";
    const effectivePersonalityMeta = personalityById(effectivePersonality);
    resetSession();
    setMeta({
      role,
      interviewType: `${effectivePersonalityMeta.label} · ${difficulty.label}`,
      personalityId: effectivePersonality,
      personalityLabel: effectivePersonalityMeta.label,
      difficultyId,
      difficultyLabel: difficulty.label,
    });
    const qs = new URLSearchParams({
      role,
      personality: effectivePersonality,
      difficulty: difficultyId,
    });
    router.push(`/interview/live?${qs.toString()}`);
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 pb-20 md:gap-14">
      <div className="pointer-events-none absolute inset-0 -z-[1] -mx-4 hidden rounded-[2rem] bg-gradient-to-br from-violet-200/65 via-transparent to-sky-200/65 opacity-[0.75] blur-px dark:hidden md:block" />

      {/* Header */}
      <div className="space-y-4 text-center md:text-left">
        <Link
          href="/dashboard"
          className="inline-flex text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to dashboard
        </Link>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            HireMind Simulator ·{" "}
            <span className="text-[var(--hm-neon-from)]">{formattedDate}</span>
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-[2.65rem]">
            Configure Your Simulation
          </h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:mx-0 md:text-[17px]">
            Fine-tune the HireMind AI parameters for your upcoming technical evaluation — role fit,
            challenge curve, and evaluator tone all sync downstream.
          </p>
          {!premium &&
          monthlyUsage &&
          monthlyUsage.plan === "free" &&
          monthlyUsage.remainingFreeThisMonth != null ? (
            <p
              className={cn(
                "mx-auto max-w-3xl rounded-xl border px-4 py-3 text-sm md:mx-0",
                freeMonthBlocked
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-border/80 bg-muted/40 text-muted-foreground",
              )}
            >
              <span className="font-medium text-foreground">Free plan: </span>
              {freeMonthBlocked
                ? `You've used all ${monthlyUsage.freeMonthlyLimit} interview preparations this month (UTC). Upgrade for unlimited sessions.`
                : `${monthlyUsage.remainingFreeThisMonth} of ${monthlyUsage.freeMonthlyLimit} free preparations left this month (UTC). Premium is unlimited.`}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(340px,0.94fr)] lg:items-start lg:gap-10">
        {/* Left controls */}
        <div className="order-2 space-y-8 lg:order-1">
          {/* Target role */}
          <section className="rounded-[1.65rem] border border-white/65 bg-background/88 p-7 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-card/72 md:p-8">
            <h2 className="font-display text-lg font-semibold tracking-tight">Target job role</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search presets or steer the simulation toward a narrower lane label.
            </p>
            <div className="relative mt-5">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 opacity-48"
                aria-hidden
              />
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={cn(
                  "h-12 rounded-xl border-border/85 bg-muted/55 pl-10 text-[15px] shadow-inner",
                  "focus-visible:bg-background md:text-[15px]",
                )}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {PRESET_JOB_CHIPS.map((chip) => {
                const picked = chip === role;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setRole(chip)}
                    className={cn(
                      "rounded-full border px-5 py-2 text-sm font-semibold tracking-tight transition-colors",
                      picked
                        ? "border-purple-950/95 bg-purple-950 text-white shadow-md shadow-purple-900/35 dark:border-primary/65 dark:bg-primary/92 dark:text-primary-foreground"
                        : "border-border/90 bg-muted/45 text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/12 dark:bg-transparent",
                    )}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Complexity */}
          <section className="rounded-[1.65rem] border border-white/65 bg-background/88 p-7 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-card/72 md:p-8">
            <h2 className="font-display text-lg font-semibold tracking-tight">Complexity level</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Calibrated depth ladders — juniors get scaffolding, exec loops see ambiguity.
            </p>
            <div className="mt-6 rounded-2xl border border-border/80 bg-muted/45 p-1.5 shadow-inner dark:border-white/12 dark:bg-black/42">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {DIFFICULTIES.map((d) => {
                  const picked = difficultyId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficultyId(d.id)}
                      title={d.hint}
                      className={cn(
                        "rounded-xl px-3 py-3 text-center text-[13px] font-semibold transition-all",
                        picked
                          ? "border border-purple-950/82 bg-purple-950 text-white shadow-inner dark:border-[var(--hm-neon-from)]/72 dark:bg-primary/92 dark:text-primary-foreground"
                          : "border border-transparent bg-transparent text-muted-foreground hover:bg-black/65 hover:text-white dark:hover:bg-white/13 dark:hover:text-foreground",
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* AI Personality */}
          <section className="relative rounded-[1.65rem] border border-white/65 bg-background/88 p-7 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-card/72 md:p-8">
            {!premium ? (
              <LockedFeatureBadge className="absolute right-7 top-7 z-10" />
            ) : null}
            <h2 className="font-display text-lg font-semibold tracking-tight">AI personality</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vocal tone, empathy balance, and how tightly feedback lands.
              {!premium ? " Free tier uses the professional interviewer; upgrade to unlock more styles." : null}
            </p>
            <div className={cn("mt-6 grid gap-4 sm:grid-cols-3", !premium && "opacity-95")}>
              {INTERVIEW_PERSONALITIES.map((p) => {
                const Icon = PERSONA_ICONS[p.id];
                const locked = !premium && p.id !== "corporate_hr";
                const picked = personalityId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (!locked) setPersonalityId(p.id);
                    }}
                    className={cn(
                      "flex flex-col gap-4 rounded-[1.25rem] border p-6 text-left transition-all",
                      locked && "cursor-not-allowed opacity-55",
                      picked
                        ? "border-[var(--hm-neon-from)]/92 bg-purple-950/90 text-white shadow-lg shadow-purple-950/52 dark:bg-primary/[0.82] dark:shadow-purple-950/45"
                        : "border-border/75 bg-muted/48 hover:bg-muted hover:shadow-sm dark:border-white/13 dark:bg-black/52 dark:hover:bg-white/10",
                      !picked ? "text-foreground" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl border text-lg",
                        picked
                          ? "border-white/30 bg-black/42 text-white shadow-inner"
                          : "border-purple-950/42 bg-purple-950/14 text-purple-950 dark:border-white/20 dark:bg-white/22 dark:text-foreground",
                      )}
                    >
                      <Icon className="size-[22px]" aria-hidden strokeWidth={1.95} />
                    </div>
                    <div>
                      <p className={cn("font-display text-[17px] font-semibold", picked && "text-white")}>{p.label}</p>
                      <p
                        className={cn(
                          "mt-2 text-[13px] leading-snug opacity-94",
                          picked ? "text-white/78" : "text-muted-foreground",
                        )}
                      >
                        {p.tone}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={freeMonthBlocked}
            className="w-full rounded-2xl border-dashed border-primary/52 py-6 text-base lg:hidden"
            onClick={handleStart}
          >
            <Play className="mr-2 size-4 fill-current" aria-hidden />
            Start Interview
          </Button>
        </div>

        {/* Preview */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="order-1 lg:sticky lg:top-28 lg:self-start lg:order-2"
        >
          <div className="rounded-[1.85rem] border border-[var(--hm-neon-from)]/52 bg-black/94 p-8 text-white shadow-[0_50px_100px_-50px_oklch(0.4_0.22_286/0.9)] hm-panel-glow dark:border-white/12 dark:bg-gradient-to-br dark:from-slate-950 dark:to-black">
            <div className="flex items-center justify-between gap-4">
              <Badge
                variant="secondary"
                className="rounded-full border border-emerald-500/62 bg-black/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200"
              >
                <span className="mr-2 inline-block size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_theme(colors.emerald.400)]" />
                SYSTEM READY
              </Badge>
              <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-white/62">
                Recruiter
              </span>
            </div>

            <div className="relative mt-7 overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-purple-950/95 via-violet-950 to-slate-950 shadow-inner">
              <div
                className="hm-noise pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_-10%,rgba(251,238,255,0.5),transparent_62%),radial-gradient(circle_at_90%_100%,rgba(99,124,247,0.35),transparent_48%)]"
                aria-hidden
              />
              <div className="relative flex aspect-[4/5] flex-col justify-end pb-12 pt-[38%]">
                <span
                  className="relative z-[1] px-12 text-center font-display text-[2.95rem] font-semibold capitalize tracking-[0.12em]"
                  aria-hidden
                >
                  <span className="bg-gradient-to-br from-white to-white/76 bg-clip-text text-transparent drop-shadow-[0_12px_36px_rgb(147,114,246)]">
                    {personality.previewName}
                  </span>
                </span>
                <span className="relative z-[1] mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.36em] text-white/74">
                  {personality.previewSubtitle}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              <MiniStatBar label="Empathy" valuePct={personality.empathyPct} />
              <MiniStatBar label="Technicality" valuePct={personality.technicalPct} />
            </div>

            <div className="mt-10 space-y-2">
              <p className="text-center text-[11px] uppercase tracking-[0.22em] text-white/72">
                {difficulty.label} · {role}
              </p>
              <button
                type="button"
                disabled={freeMonthBlocked}
                onClick={() => handleStart()}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "min-h-14 w-full gap-3 rounded-xl border-0 bg-gradient-to-r from-[#e9d5ff] via-[#d8b4fe] to-[#a855f7] py-7 font-display text-base font-semibold text-[#0b0414] shadow-[0_36px_60px_-32px_rgb(148,118,237)] hover:opacity-[0.94] disabled:opacity-45",
                )}
              >
                <Play className="size-6 fill-purple-950 text-purple-950" aria-hidden />
                Start Interview
              </button>
              <p className="text-center text-[11px] text-white/60">
                Your choices sync instantly with the waveform bridge.
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
