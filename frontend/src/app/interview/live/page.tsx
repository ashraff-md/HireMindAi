"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AmbientOrbs } from "@/components/ambient-orbs";
import { HmCard } from "@/components/hm-card";
import { InterviewWaveform } from "@/components/interview-waveform";
import { RecruiterAvatar } from "@/components/recruiter-avatar";
import { VoiceChatBubble } from "@/components/voice-chat-bubble";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  feedbackInterviewApi,
  respondInterviewApi,
  startInterviewApi,
} from "@/lib/interview-api";
import { difficultyById, personalityById } from "@/lib/interview-options";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useInterviewStore } from "@/stores/interview-store";

async function playOptionalAudio(url: string) {
  if (!url?.trim()) {
    return;
  }

  try {
    const audio = new Audio(url);
    await audio.play().catch(() => undefined);
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
    });
  } catch {
    /* autoplay blocked or missing asset */
  }
}

function formatMmSs(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function LiveInterviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? "Software Engineer";
  const personalityParam = searchParams.get("personality") ?? "";
  const difficultyParam = searchParams.get("difficulty") ?? "";

  const personalityLabelStore = useInterviewStore((s) => s.personalityLabel);
  const difficultyLabelStore = useInterviewStore((s) => s.difficultyLabel);
  const recruiterLabel =
    personalityLabelStore.trim() ||
    (personalityParam ? personalityById(personalityParam).label : "AI Recruiter");
  const tierLabel =
    difficultyLabelStore.trim() ||
    (difficultyParam ? difficultyById(difficultyParam).label : "");

  const authReady = useAuthStore((s) => s.authReady);

  const userId = useAuthStore((s) => s.userId);
  const plan = useAuthStore((s) => s.plan);

  const messages = useInterviewStore((s) => s.messages);
  const phase = useInterviewStore((s) => s.phase);
  const elapsedSeconds = useInterviewStore((s) => s.elapsedSeconds);
  const currentQuestion = useInterviewStore((s) => s.currentQuestion);
  const backendMockBanner = useInterviewStore((s) => s.backendMockBanner);
  const interviewId = useInterviewStore((s) => s.interviewId);

  const bootSeq = useRef(0);

  const tick = useInterviewStore((s) => s.tick);
  const setPhase = useInterviewStore((s) => s.setPhase);
  const pushMessage = useInterviewStore((s) => s.pushMessage);
  const setCurrentQuestion = useInterviewStore((s) => s.setCurrentQuestion);
  const setBackendMockBanner = useInterviewStore((s) => s.setBackendMockBanner);
  const setFeedback = useInterviewStore((s) => s.setFeedback);

  const [answerDraft, setAnswerDraft] = useState("");
  const [bootError, setBootError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const mode = plan === "premium" ? "premium" : "free";

  useEffect(() => {
    if (!authReady) {
      return;
    }
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [tick, authReady]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const bootId = ++bootSeq.current;
    let cancelled = false;

    async function boot() {
      const iv = useInterviewStore.getState();

      setBootError(null);
      iv.resetTimer();
      iv.setPhase("thinking");

      try {
        const uid = useAuthStore.getState().userId;

        const res = await startInterviewApi({
          role,
          mode,
          userId: uid,
        });

        if (cancelled || bootId !== bootSeq.current) {
          return;
        }

        iv.setInterviewId(res.interviewId);
        iv.setBackendMockBanner(Boolean(res.mock));
        iv.pushMessage("ai", res.question);
        iv.setCurrentQuestion(res.question);
        iv.setPhase("ai_speaking");
        await playOptionalAudio(res.audioUrl);
        if (cancelled || bootId !== bootSeq.current) {
          return;
        }
        iv.setPhase("listening");
      } catch (e) {
        if (!cancelled && bootId === bootSeq.current) {
          setBootError(e instanceof Error ? e.message : "Failed to start.");
          iv.setPhase("idle");
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [authReady, role, mode]);

  const phaseBadge = useMemo(() => {
    switch (phase) {
      case "ai_speaking":
        return { label: "AI speaking", variant: "default" as const };
      case "listening":
        return { label: "Your turn · listening", variant: "secondary" as const };
      case "user_speaking":
        return { label: "You · drafting answer", variant: "outline" as const };
      case "thinking":
        return { label: "Processing…", variant: "outline" as const };
      default:
        return { label: "Idle", variant: "outline" as const };
    }
  }, [phase]);

  if (!authReady) {
    return <LiveFallback />;
  }

  async function submitAnswer() {
    const text = answerDraft.trim();
    if (!text || !interviewId) {
      return;
    }

    setAnswerDraft("");
    setPhase("thinking");
    pushMessage("user", text);

    try {
      const res = await respondInterviewApi({
        interviewId,
        answer: text,
        userId,
      });

      pushMessage("ai", res.nextQuestion);
      setCurrentQuestion(res.nextQuestion);
      if (res.mock) {
        setBackendMockBanner(true);
      }
      setPhase("ai_speaking");
      await playOptionalAudio(res.audioUrl);
      setPhase("listening");
    } catch {
      setPhase("listening");
    }
  }

  async function finishInterview() {
    if (!interviewId) {
      return;
    }

    setPhase("thinking");
    try {
      const fb = await feedbackInterviewApi({ interviewId, userId });
      setFeedback(fb);
      router.push("/interview/feedback");
    } catch {
      setPhase("listening");
    }
  }

  return (
    <div className="relative flex flex-col gap-8 pb-14 md:gap-10 md:pb-16">
      <AmbientOrbs />

      <motion.div
        layout
        className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      >
        <div>
          <Link
            href="/interview/setup"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Adjust setup
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-[2.25rem]">
            Live interview bridge
          </h1>
          <p className="mt-2 text-muted-foreground">
            <span className="text-foreground">{role}</span>
            {tierLabel ? (
              <>
                {" "}
                · <span className="text-foreground/90">{tierLabel}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <Badge variant={phaseBadge.variant} className="hm-ring-glow px-3 py-1">
            {phaseBadge.label}
          </Badge>
          <div className="hm-ring-glow flex items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-2 tabular-nums backdrop-blur-md max-md:backdrop-blur-sm dark:bg-black/50">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Timer
            </span>
            <span className="font-display text-lg text-foreground">
              {formatMmSs(elapsedSeconds)}
            </span>
          </div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Exit
          </Link>
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-col gap-4">
        {backendMockBanner ? (
          <p className="rounded-xl border border-sky-500/35 bg-sky-500/10 px-4 py-3 text-sm text-sky-950 dark:text-sky-50">
            Demo mode · AI voice + scoring mocked locally or via backend{" "}
            <code className="text-xs">x-hiremind-mock</code> headers.
          </p>
        ) : userId ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-950 dark:text-emerald-50">
            Authenticated session — responses hit Supabase-backed APIs when{" "}
            <code className="text-[11px]">backend/.env.local</code> is configured.
          </p>
        ) : (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs">
            Guest session · mock pipeline only. Sign in with Supabase to exercise real
            inserts under <code className="text-[11px]">public.interviews</code>.
          </p>
        )}

        {bootError ? (
          <p className="text-sm text-destructive" role="alert">
            {bootError}
          </p>
        ) : null}
      </div>

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.92fr)]">
        <motion.div
          layout
          className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-black/55 via-black/35 to-black/20 p-6 shadow-[0_0_80px_-40px_var(--hm-glow-mid)] backdrop-blur-xl max-md:backdrop-blur-md md:p-9 dark:from-black/65 dark:via-black/45 dark:to-black/25"
          transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div
            className="pointer-events-none absolute inset-0 hm-panel-glow opacity-70"
            aria-hidden
          />
          <div className="relative flex flex-col gap-10">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
              <RecruiterAvatar
                label={recruiterLabel}
                subtitle={[role, tierLabel].filter(Boolean).join(" · ")}
                size="xl"
                speaking={phase === "ai_speaking"}
              />
              <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1",
                      phase === "ai_speaking" || phase === "thinking"
                        ? "border-[var(--hm-neon-from)]/45 bg-[var(--hm-neon-from)]/15 text-foreground"
                        : "border-white/10 bg-black/25",
                    )}
                  >
                    AI voice lane
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    Neural waveform
                  </span>
                </div>
                <InterviewWaveform
                  active={phase === "ai_speaking" || phase === "thinking"}
                  variant="ai"
                  size="cinema"
                  className="w-full shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-black/30 p-5 backdrop-blur-md max-md:backdrop-blur-sm dark:bg-black/45">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Live question
              </p>
              <p className="mt-3 text-base leading-relaxed md:text-lg">
                {currentQuestion ??
                  "Initializing session — syncing first interviewer prompt…"}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-4">
                <InterviewWaveform
                  active={phase === "listening" || phase === "user_speaking"}
                  variant="user"
                  size="comfortable"
                  className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-4 max-md:backdrop-blur-sm"
                />
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-3 py-1.5 backdrop-blur-sm",
                      phase === "listening" || phase === "user_speaking"
                        ? "border-emerald-500/35 text-emerald-100"
                        : "opacity-70",
                    )}
                  >
                    <Mic className="size-3.5 text-emerald-400" aria-hidden />
                    Mic-ready lane
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex size-2 rounded-full bg-emerald-500",
                        phase === "listening" || phase === "user_speaking"
                          ? "animate-pulse shadow-[0_0_12px_oklch(0.72_0.18_145)]"
                          : "opacity-35",
                      )}
                    />
                    Draft answers sync to transcript · WebSpeech hook next.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <HmCard className="flex max-h-[720px] min-h-0 flex-col gap-4 overflow-hidden border-white/12 p-0 shadow-[0_0_60px_-36px_var(--hm-glow-mid)] backdrop-blur-xl max-md:backdrop-blur-md">
          <CardHeader className="border-b border-white/10 px-5 pb-4 pt-5">
            <CardTitle className="text-lg">Transcript</CardTitle>
            <CardDescription>
              Glass hybrid view mirrors recruiter panels — tuned for cinematic contrast.
            </CardDescription>
          </CardHeader>
          <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
            <div className="flex flex-col gap-3 py-2 pr-3">
              {messages.map((m) => (
                <VoiceChatBubble key={m.id} role={m.role} text={m.text} />
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="space-y-3 border-t border-white/10 bg-muted/30 p-4 backdrop-blur-md max-md:backdrop-blur-sm">
            <Textarea
              placeholder='Draft your spoken answer — e.g. "At HireMind we shipped…"'
              rows={4}
              value={answerDraft}
              disabled={phase !== "listening" && phase !== "user_speaking"}
              onFocus={() => setPhase("user_speaking")}
              onBlur={() => {
                if (phase === "user_speaking") {
                  setPhase("listening");
                }
              }}
              onChange={(e) => setAnswerDraft(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void submitAnswer()}
                disabled={
                  phase === "thinking" ||
                  phase === "ai_speaking" ||
                  !answerDraft.trim()
                }
              >
                Send answer
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void finishInterview()}
                disabled={phase === "thinking" || !interviewId}
              >
                End &amp; analyze
              </Button>
            </div>
          </div>
        </HmCard>
      </div>
    </div>
  );
}

function LiveFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

export default function LiveInterviewPage() {
  return (
    <Suspense fallback={<LiveFallback />}>
      <LiveInterviewInner />
    </Suspense>
  );
}
