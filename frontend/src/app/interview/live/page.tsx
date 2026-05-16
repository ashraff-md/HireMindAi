"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Menu,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Square,
  Wifi,
} from "lucide-react";

import { HmCard } from "@/components/hm-card";
import { InterviewWaveform } from "@/components/interview-waveform";
import { RecruiterAvatar } from "@/components/recruiter-avatar";
import { VoiceChatBubble } from "@/components/voice-chat-bubble";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  feedbackInterviewApi,
  respondInterviewApi,
  startInterviewApi,
} from "@/lib/interview-api";
import { difficultyById, personalityById } from "@/lib/interview-options";
import { displayNameFromEmail } from "@/lib/display-name";
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
  const email = useAuthStore((s) => s.email);

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
  const [micMuted, setMicMuted] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const mode = plan === "premium" ? "premium" : "free";

  const initials = displayNameFromEmail(email)
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const wordCount = useMemo(() => {
    const corpus = messages.map((m) => m.text).join(" ").trim();
    if (!corpus) return 0;
    return corpus.split(/\s+/).filter(Boolean).length;
  }, [messages]);

  useEffect(() => {
    if (!authReady) {
      return;
    }
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [tick, authReady]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

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

  const listeningForUser = phase === "listening" || phase === "user_speaking";

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
    <div className="relative flex flex-col gap-6 pb-12 md:gap-10 md:pb-16">
      <header className="relative z-[2] grid gap-4 rounded-2xl border border-white/12 bg-black/80 px-4 py-4 shadow-[0_28px_100px_-60px_oklch(0.55_0.22_286/0.35)] backdrop-blur-2xl sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight">
            HireMind<span className="hm-text-neon"> AI</span>
          </Link>
          <Link
            href="/interview/setup"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-foreground",
            )}
            title="Adjust setup"
          >
            Setup
          </Link>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/70 px-5 py-2.5 backdrop-blur-md">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgb(239,68,68)]" />
            </span>
            <Radio className="size-4 text-purple-400" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.42em] text-white/90">
              Live session
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="leading-tight sm:text-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Interview timer
            </p>
            <p className="font-display text-2xl tabular-nums text-white">{formatMmSs(elapsedSeconds)}</p>
          </div>
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-purple-400/55 bg-gradient-to-br from-purple-900/95 to-purple-950 font-display text-xs font-semibold uppercase text-white shadow-[0_14px_40px_-22px_rgb(147,114,239)]"
            title={email ?? "Guest"}
          >
            {(initials || "GU").slice(0, 2)}
          </div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm", className: "hidden sm:inline-flex" }))}
          >
            Exit
          </Link>
        </div>
      </header>

      <div className="relative z-[1] flex flex-col gap-3">
        {backendMockBanner ? (
          <p className="rounded-xl border border-sky-500/35 bg-sky-500/10 px-4 py-2.5 text-sm text-sky-950 dark:text-sky-50">
            Demo mode · Responses may be mocked (<code className="text-[11px]">x-hiremind-mock</code>).
          </p>
        ) : userId ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-950 dark:text-emerald-50">
            Authenticated pipeline — wired to backend when configured.
          </p>
        ) : (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/12 px-4 py-2.5 text-xs">
            Guest session · mock replies only unless you sign in.
          </p>
        )}
        {bootError ? (
          <p className="text-sm text-destructive" role="alert">
            {bootError}
          </p>
        ) : null}
      </div>

      <div className="relative z-[1] grid gap-8 xl:grid-cols-[minmax(0,1.42fr)_minmax(328px,0.94fr)] xl:items-start">
        {/* Main stage */}
        <div className="relative overflow-hidden rounded-[1.85rem] border border-purple-500/35 bg-neutral-950/95 p-7 shadow-[0_72px_120px_-76px_oklch(0.55_0.22_286/0.28)] xl:p-10">
          <div
            className="pointer-events-none absolute -left-32 top-[-12%] size-[540px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.58_0.22_286/0.32),transparent_72%)] blur-3xl"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 hm-noise opacity-[0.08] mix-blend-overlay" aria-hidden />

          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-8 pt-4">
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-[-24%] rounded-full bg-[radial-gradient(circle,oklch(0.85_0.08_195/0.28),transparent_70%)] blur-[72px]"
                aria-hidden
              />
              <div className="relative rounded-full shadow-[0_0_112px_-8px_oklch(0.62_0.22_286/0.45)] ring-4 ring-purple-500/35 ring-offset-[16px] ring-offset-black">
                <RecruiterAvatar
                  label={recruiterLabel}
                  subtitle={[role, tierLabel].filter(Boolean).join(" · ") || "Interview lane"}
                  size="xl"
                  speaking={phase === "ai_speaking"}
                />
              </div>
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-3 rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.32em]",
                listeningForUser
                  ? "border-[var(--hm-neon-from)]/65 bg-purple-950/90 text-white shadow-[0_20px_60px_-40px_rgb(168,85,247)]"
                  : "border-white/15 bg-black/60 text-muted-foreground",
              )}
            >
              <span className="flex h-8 items-end gap-0.5" aria-hidden>
                {[10, 18, 26, 18, 10, 22].map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-1 rounded-full bg-gradient-to-t from-[var(--hm-neon-from)] to-purple-300",
                      listeningForUser && "animate-pulse",
                    )}
                    style={{
                      height: listeningForUser ? `${h + 10}px` : `${Math.round(h * 0.45)}px`,
                      animationDelay: `${i * 95}ms`,
                    }}
                  />
                ))}
              </span>
              {phase === "ai_speaking" ? "AI speaking" : "AI is listening"}
            </div>

            <InterviewWaveform
              whatsappBubble
              elapsedSeconds={elapsedSeconds}
              active={
                phase === "ai_speaking" ||
                phase === "thinking" ||
                listeningForUser
              }
              variant="ai"
              size="cinema"
              className="mx-auto w-full max-w-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            />

            <p className="-mt-2 max-w-xl text-center text-sm leading-relaxed text-white/70">
              {currentQuestion ?? "Syncing interviewer prompt…"}
            </p>

            <div className="flex w-full max-w-sm items-center justify-center gap-10 pt-4">
              <button
                type="button"
                aria-pressed={micMuted}
                aria-label={micMuted ? "Unmute microphone" : "Mute microphone"}
                onClick={() => setMicMuted((m) => !m)}
                className={cn(
                  "flex size-14 items-center justify-center rounded-full border-2 backdrop-blur-md transition-colors",
                  micMuted
                    ? "border-white/20 bg-purple-950/80 text-white hover:bg-purple-900/95"
                    : "border-purple-400/65 bg-purple-600/85 text-white",
                )}
              >
                {micMuted ? (
                  <MicOff className="size-6" aria-hidden strokeWidth={1.7} />
                ) : (
                  <Mic className="size-6" aria-hidden strokeWidth={2} />
                )}
              </button>

              <div className="relative flex shrink-0 items-center justify-center">
                <span className="pointer-events-none absolute inset-[-16px] rounded-full bg-purple-400/55 opacity-65 blur-xl" aria-hidden />
                <button
                  type="button"
                  aria-label="Session pause coming soon"
                  disabled
                  className="relative flex size-[4.5rem] items-center justify-center rounded-full border-[3px] border-white/80 bg-black shadow-[inset_0_0_0_1px_rgb(255,255,255/0.2)] disabled:opacity-40"
                  title="Pause control ships later"
                >
                  <Square className="size-7 shrink-0 fill-purple-950 text-purple-100" aria-hidden strokeWidth={0} />
                </button>
              </div>

              <button
                type="button"
                aria-label="End interview"
                onClick={() => void finishInterview()}
                disabled={phase === "thinking" || !interviewId}
                className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-red-500/80 bg-gradient-to-br from-red-600/98 to-neutral-950 text-white shadow-[0_22px_50px_-16px_oklch(0.62_0.22_25/0.45)] backdrop-blur-sm transition-opacity hover:opacity-95 disabled:opacity-38"
              >
                <PhoneOff className="size-6" aria-hidden strokeWidth={1.65} />
              </button>
            </div>

            {phase === "thinking" && !bootError ? (
              <Loader2 className="size-6 animate-spin text-purple-400" aria-label="Thinking" />
            ) : null}
          </div>
        </div>

        <HmCard className="flex flex-col gap-0 overflow-hidden rounded-[1.85rem] border border-white/10 bg-neutral-950/95 p-0 shadow-[0_0_96px_-48px_oklch(0.72_0.13_195/0.22)] xl:sticky xl:top-28">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <Menu className="size-5 text-muted-foreground" aria-hidden />
              <span className="font-display text-lg font-semibold tracking-tight">Live transcript</span>
            </div>
            <Badge
              variant="outline"
              className="rounded-md border-emerald-500/55 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400"
            >
              Real-time
            </Badge>
          </div>

          <ScrollArea className="min-h-[340px] max-h-[min(56vh,520px)]">
            <div className="flex flex-col gap-3 px-4 py-5">
              {messages.map((m) => (
                <VoiceChatBubble key={m.id} role={m.role} text={m.text} />
              ))}
              {phase === "user_speaking" ? (
                <div className="flex justify-end">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.12] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    <span className="size-2 animate-pulse rounded-full bg-purple-400" aria-hidden />
                    Speaking…
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 uppercase tracking-[0.18em]">
              <Wifi className="size-4 text-purple-400" aria-hidden strokeWidth={1.75} />
              Low latency link
            </span>
            <span className="tabular-nums">
              Word count: <strong className="text-foreground">{wordCount}</strong>
            </span>
          </div>

          <div className="mx-4 mb-4 rounded-xl border border-purple-500/40 bg-purple-950/50 p-4 shadow-inner backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-300">Upcoming topic</p>
            <p className="mt-2 font-display text-base font-semibold leading-snug text-foreground">
              Cultural alignment &amp; leadership style
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Map exec influence and team calibration without sacrificing authenticity.
            </p>
          </div>

          <div className="space-y-3 border-t border-white/10 p-5">
            <Textarea
              placeholder="Draft your spoken answer — STAR structure encouraged."
              rows={4}
              value={answerDraft}
              disabled={phase !== "listening" && phase !== "user_speaking"}
              onFocus={() => setPhase("user_speaking")}
              onBlur={() => {
                if (phase === "user_speaking") setPhase("listening");
              }}
              onChange={(e) => setAnswerDraft(e.target.value)}
              className="rounded-xl border-white/14 bg-black/45 text-[15px] text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="lg"
                className="rounded-xl"
                onClick={() => void submitAnswer()}
                disabled={phase === "thinking" || phase === "ai_speaking" || !answerDraft.trim()}
              >
                Send answer
              </Button>
              <Button type="button" variant="outline" disabled className="rounded-xl opacity-60" title="Coming soon">
                Save clip
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl bg-red-600/90 hover:bg-red-600"
                onClick={() => void finishInterview()}
                disabled={phase === "thinking" || !interviewId}
              >
                End &amp; analyze
              </Button>
            </div>
          </div>
        </HmCard>
      </div>

      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm", className: "fixed bottom-6 right-4 z-[5] rounded-full shadow-lg sm:hidden" }),
        )}
      >
        Exit
      </Link>
    </div>
  );
}

function LiveFallback() {
  return (
    <div className="space-y-4 py-28">
      <Skeleton className="h-96 w-full rounded-[2rem]" />
      <Skeleton className="hidden h-[480px] w-full rounded-[2rem] xl:block" />
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
