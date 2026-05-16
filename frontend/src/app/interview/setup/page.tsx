"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { HmCard } from "@/components/hm-card";
import { RecruiterAvatar } from "@/components/recruiter-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DIFFICULTIES,
  INTERVIEW_PERSONALITIES,
  JOB_ROLES,
  difficultyById,
  personalityById,
} from "@/lib/interview-options";
import { cn } from "@/lib/utils";
import { useInterviewStore } from "@/stores/interview-store";

export default function InterviewSetupPage() {
  const router = useRouter();
  const resetSession = useInterviewStore((s) => s.resetSession);
  const setMeta = useInterviewStore((s) => s.setMeta);

  const [role, setRole] = useState<string>(JOB_ROLES[0] ?? "Software Engineer");
  const [personalityId, setPersonalityId] = useState<string>(
    INTERVIEW_PERSONALITIES[0]?.id ?? "corporate_hr",
  );
  const [difficultyId, setDifficultyId] = useState<string>(
    DIFFICULTIES[1]?.id ?? "mid",
  );

  const personality = personalityById(personalityId);
  const difficulty = difficultyById(difficultyId);

  function handleStart() {
    resetSession();
    setMeta({
      role,
      interviewType: `${personality.label} · ${difficulty.label}`,
      personalityId,
      personalityLabel: personality.label,
      difficultyId,
      difficultyLabel: difficulty.label,
    });
    const qs = new URLSearchParams({
      role,
      personality: personalityId,
      difficulty: difficultyId,
    });
    router.push(`/interview/live?${qs.toString()}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-16">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]">
          Mission briefing
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground md:text-lg">
          Configure persona pressure, difficulty calibration, and role targeting — we mirror this stack inside the cinematic bridge.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-start">
        <div className="space-y-8">
          <HmCard className="gap-6 p-6 md:p-8">
            <CardHeader className="p-0">
              <CardTitle className="font-display text-xl">Target role</CardTitle>
              <CardDescription>Select the lane interview probes optimize toward.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-0">
              <Label htmlFor="role">Job role</Label>
              <select
                id="role"
                className={cn(
                  "flex h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm outline-none backdrop-blur-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/45 dark:bg-background/35",
                )}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {JOB_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </CardContent>
          </HmCard>

          <HmCard className="gap-6 p-6 md:p-8">
            <CardHeader className="p-0">
              <CardTitle className="font-display text-xl">Interviewer personality</CardTitle>
              <CardDescription>Maps directly into recruiter avatar + tone scaffolding.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-0 sm:grid-cols-2">
              {INTERVIEW_PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersonalityId(p.id)}
                  className={cn(
                    buttonVariants({
                      variant: personalityId === p.id ? "default" : "outline",
                    }),
                    "h-auto flex-col items-start gap-2 whitespace-normal px-4 py-4 text-left text-sm font-normal",
                  )}
                >
                  <span className="font-display font-semibold">{p.label}</span>
                  <span className="text-xs text-muted-foreground">{p.tone}</span>
                </button>
              ))}
            </CardContent>
          </HmCard>

          <HmCard className="gap-6 p-6 md:p-8">
            <CardHeader className="p-0">
              <CardTitle className="font-display text-xl">Difficulty spectrum</CardTitle>
              <CardDescription>Calibrate behavioral vs technical altitude.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 p-0">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficultyId(d.id)}
                  className={cn(
                    buttonVariants({
                      variant: difficultyId === d.id ? "secondary" : "outline",
                      size: "sm",
                    }),
                    "rounded-full px-5 py-2 text-xs uppercase tracking-[0.14em]",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </CardContent>
          </HmCard>

          <Button
            type="button"
            size="lg"
            className="w-full rounded-2xl text-base shadow-[0_0_48px_-18px_var(--hm-glow-mid)] md:w-auto md:min-w-[280px]"
            onClick={handleStart}
          >
            Start interview
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="lg:sticky lg:top-28"
        >
          <HmCard className="gap-6 overflow-hidden border-[var(--hm-neon-from)]/35 bg-black/35 p-8 backdrop-blur-2xl dark:bg-black/55 hm-panel-glow">
            <CardHeader className="p-0 text-center">
              <CardTitle className="font-display text-xl">Recruiter preview</CardTitle>
              <CardDescription>Orb reacts inside the live spectral hall.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 p-0">
              <RecruiterAvatar
                label={personality.label}
                subtitle={`${difficulty.label} · ${role}`}
                speaking={false}
              />
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                {personality.tone}
              </p>
            </CardContent>
          </HmCard>
        </motion.div>
      </div>
    </div>
  );
}
