"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Hexagon,
  Mic,
  Mic2,
  Star,
  TrendingUp,
} from "lucide-react";

import { HeroWaveform } from "@/components/hero-waveform";
import { HmGlowOrb } from "@/components/hm-glow-orb";
import { HmGradientBorder } from "@/components/hm-gradient-border";
import { HmCard } from "@/components/hm-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function StarRow() {
  return (
    <div className="flex gap-0.5 text-[#3b82f6]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-current stroke-none" />
      ))}
    </div>
  );
}

/** Vertical bars — reads closer to the mock bar widget */
function FeedbackBarChart() {
  const bars = [
    { h: "h-[72%]", gradient: "from-sky-400 to-[var(--hm-neon-from)]" },
    { h: "h-[95%]", gradient: "from-teal-400 to-cyan-500" },
    { h: "h-[48%]", gradient: "from-blue-500 to-[var(--hm-neon-to)]" },
    { h: "h-[82%]", gradient: "from-cyan-400 to-blue-400" },
    { h: "h-[58%]", gradient: "from-[var(--hm-neon-from)] to-sky-500" },
  ];
  return (
    <div className="flex min-h-[148px] flex-1 items-end justify-center gap-2 rounded-xl border border-white/10 bg-black/45 px-4 pb-3 pt-6 dark:bg-black/55">
      {bars.map((b, i) => (
        <div
          key={i}
          className={cn(
            "w-5 max-w-[18%] flex-1 rounded-t-md bg-gradient-to-t opacity-95 shadow-[0_0_16px_-6px_var(--hm-glow-mid)]",
            b.h,
            b.gradient,
          )}
        />
      ))}
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Two sessions flattened my behavioral rambling. The waveform keeps nerves in check mid-answer.",
    initials: "JW",
    name: "James Wilson",
    title: "Senior Eng @ Tech Giant",
  },
  {
    quote:
      "Stress interviewer preset exposed gaps internal mocks never surfaced. Feedback lands instantly.",
    initials: "SK",
    name: "Sarah Kim",
    title: "Product Lead @ Growth Startup",
  },
  {
    quote:
      "The glass UI reads like a serious hiring product — our team adopted it for weekly loops.",
    initials: "ML",
    name: "Marcus Liu",
    title: "Staff Engineer @ Finance Org",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-12 md:gap-28 md:pb-20">
      {/* Hero */}
      <section className="relative pt-2 md:pt-6">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 opacity-55 md:-translate-y-8">
          <HmGlowOrb size="lg" />
        </div>

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-background/55 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur-xl dark:bg-black/45"
          >
            Next-gen recruiting.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-8 font-display text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.35rem]"
          >
            Practice Real Interviews With{" "}
            <span className="bg-gradient-to-r from-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent">
              AI Voice Recruiters
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Master your next career move with immersive, high-fidelity AI simulations that speak,
            listen, and evaluate like world-class human recruiters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-2xl border-0 bg-[#c084fc] px-10 text-[#0a0a0a] shadow-[0_0_36px_-12px_var(--hm-glow-mid)] hover:bg-[#d8b4fe]",
              )}
            >
              Start Free
            </Link>
            <Link
              href="/#pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-2xl border-white/25 bg-transparent",
              )}
            >
              Upgrade to Premium
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="relative mx-auto mt-14 max-w-5xl"
        >
          <div className="absolute -inset-10 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_35%,var(--hm-neon-from),transparent_55%)] opacity-40 blur-3xl dark:opacity-50" />
          <HmGradientBorder rounded="rounded-[2rem]" className="rounded-[2rem]">
            <div className="rounded-[calc(2rem-1px)] bg-black/40 p-6 backdrop-blur-2xl dark:bg-black/60 md:p-10">
              <HeroWaveform active />
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <div className="flex size-11 items-center justify-center rounded-full border border-[var(--hm-neon-from)]/35 bg-[var(--hm-neon-from)]/10 shadow-[0_0_28px_-8px_var(--hm-glow-mid)]">
                  <Mic className="size-5 text-[var(--hm-neon-from)]" aria-hidden />
                </div>
                <p className="text-center text-sm font-medium tracking-tight text-muted-foreground shadow-[0_0_24px_-12px_var(--hm-neon-from)] sm:text-left">
                  Listening for candidate response…
                </p>
              </div>
            </div>
          </HmGradientBorder>
        </motion.div>
      </section>

      {/* Features — bento */}
      <section id="features" className="scroll-mt-28 space-y-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--hm-neon-from)]">
            Features
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Precision-engineered intelligence
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)] md:items-stretch lg:grid-cols-3 lg:gap-6">
          <motion.div
            className="md:col-span-1 lg:col-span-2"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
          >
            <HmCard className="flex h-full min-h-0 flex-col gap-6 border-white/12 bg-card/65 p-6 dark:bg-card/55 md:p-8 lg:min-h-[400px]">
              <div className="flex shrink-0 gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-neon-from)]/18 text-[var(--hm-neon-from)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-[var(--hm-neon-from)]/35">
                  <Hexagon className="size-6" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 space-y-2.5">
                  <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl lg:text-2xl">
                    AI-powered role simulation
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    Pick target roles and interviewer personas — adaptive pacing and tone that mirror
                    live panels instead of static Q&amp;A scripts.
                  </p>
                </div>
              </div>
              <div className="relative min-h-[200px] w-full flex-1 overflow-hidden rounded-2xl border border-[var(--hm-neon-from)]/25 bg-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] lg:min-h-[260px]">
                <Image
                  src="/ai-powered-role-simulation.png"
                  alt="Abstract neural network visualization representing AI-powered role simulation"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 960px"
                />
              </div>
            </HmCard>
          </motion.div>

          <motion.div
            className="md:col-span-1 lg:col-span-1"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <HmCard className="flex h-full min-h-0 flex-col gap-6 border-white/12 bg-card/65 p-6 dark:bg-card/55 md:p-8 lg:min-h-[400px]">
              <div className="flex shrink-0 gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-neon-to)]/18 text-[var(--hm-neon-to)] ring-1 ring-[var(--hm-neon-to)]/30">
                  <TrendingUp className="size-6" aria-hidden />
                </div>
                <div className="min-w-0 space-y-2.5">
                  <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl">
                    Real-time feedback
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    See where answers drift — tighten stories before your real loop with clear,
                    dimension-level cues.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-end pt-1">
                <FeedbackBarChart />
              </div>
            </HmCard>
          </motion.div>

          <motion.div
            className="md:col-span-2 lg:col-span-3"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <HmCard className="gap-8 border-white/12 bg-card/60 p-6 backdrop-blur-2xl dark:bg-card/50 md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-center md:p-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-neon-from)]/18 text-[var(--hm-neon-from)] ring-1 ring-[var(--hm-neon-from)]/30">
                  <Mic2 className="size-6" aria-hidden />
                </div>
                <div>
                  <CardTitle className="font-display text-xl md:text-2xl">
                    Immersive voice engine
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-xl text-base leading-relaxed">
                    Spectral waveform telemetry tuned for conversational pacing — closer to human
                    recruiters than flat chat transcripts.
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 md:justify-end">
                <div className="flex min-w-[140px] flex-1 flex-col rounded-2xl border border-white/10 bg-black/35 px-6 py-5 dark:bg-black/50">
                  <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
                    0.4s
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Response latency</p>
                </div>
                <div className="flex min-w-[140px] flex-1 flex-col rounded-2xl border border-white/10 bg-black/35 px-6 py-5 dark:bg-black/50">
                  <div className="mb-2 flex items-end gap-1 opacity-90" aria-hidden>
                    {[36, 52, 28, 64, 44].map((pct, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full bg-gradient-to-t from-[var(--hm-neon-from)] to-[var(--hm-neon-to)]"
                        style={{ height: `${pct}px` }}
                      />
                    ))}
                  </div>
                  <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
                    24-bit
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Audio quality</p>
                </div>
              </div>
            </HmCard>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-28 space-y-10 pb-12 md:space-y-12 md:pb-20">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--hm-neon-from)]">
            Pricing
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Choose your career path
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch">
          <HmCard className="flex h-full flex-col gap-8 border-white/12 bg-card/65 p-8 backdrop-blur-2xl dark:bg-card/50">
            <CardHeader className="space-y-2 p-0">
              <CardTitle className="font-display text-2xl">Free</CardTitle>
              <p className="font-display text-4xl font-semibold tracking-tight">
                $0
                <span className="text-lg font-normal text-muted-foreground"> /month</span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 p-0">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "3 interviews per month",
                  "Basic performance feedback",
                  "Core recruiter personas",
                  "Glass transcript experience",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="size-5 shrink-0 text-[#3b82f6]" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="mt-auto w-full shrink-0 border-t border-white/10 pt-8 pb-4">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "flex h-12 w-full items-center justify-center rounded-xl border-white/20 bg-transparent hover:bg-white/5",
                )}
              >
                Start For Free
              </Link>
            </div>
          </HmCard>

          <HmCard className="relative flex h-full flex-col gap-8 overflow-hidden border-[var(--hm-neon-from)]/35 bg-gradient-to-br from-[var(--hm-neon-from)]/14 via-transparent to-[var(--hm-neon-to)]/14 p-8 hm-panel-glow">
            <div className="absolute right-6 top-6">
              <Badge className="rounded-md bg-gradient-to-r from-[#a855f7] to-[#3b82f6] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-none hover:opacity-95">
                Recommended
              </Badge>
            </div>
            <CardHeader className="space-y-2 p-0 pr-28">
              <CardTitle className="font-display text-2xl">Premium</CardTitle>
              <p className="font-display text-4xl font-semibold tracking-tight">
                $29
                <span className="text-lg font-normal text-muted-foreground"> /month</span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 p-0">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Unlimited AI interviews",
                  "Advanced behavioral analytics",
                  "15+ industry-specific AI personas",
                  "Resume-aware question lanes",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="size-5 shrink-0 text-[#3b82f6]" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="mt-auto w-full shrink-0 border-t border-white/10 pt-8 pb-4">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "flex h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white shadow-[0_0_46px_-18px_var(--hm-glow-mid)] hover:opacity-95",
                )}
              >
                Get Premium Access
              </Link>
            </div>
          </HmCard>
        </div>
      </section>

      {/* Testimonials / About */}
      <section id="about" className="scroll-mt-28 space-y-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--hm-neon-from)]">
            Social proof
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Trusted by high-performers
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <HmCard className="h-full gap-5 border-white/12 bg-card/55 p-6 backdrop-blur-2xl">
                <StarRow />
                <blockquote className="text-sm italic leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-[var(--hm-neon-from)]/25 to-[var(--hm-neon-to)]/20 font-display text-xs font-semibold text-foreground">
                    {t.initials}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </HmCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-[2rem] border border-white/12 bg-card/55 px-8 py-14 text-center backdrop-blur-2xl hm-ring-glow md:px-14 md:py-16">
        <h3 className="font-display text-2xl font-semibold md:text-3xl">
          Ready to ace your next interview?
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
          Join{" "}
          <strong className="font-semibold text-foreground">50,000+ professionals</strong> who
          sharpen their stories with HireMind — voice-native sessions, timers, and debrief charts
          included.
        </p>
        <div className="mt-10 flex justify-center">
          <HmGradientBorder rounded="rounded-2xl" className="inline-flex rounded-2xl">
            <Link
              href="/interview/setup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#3b82f6] px-12 text-white shadow-[0_0_44px_-16px_var(--hm-glow-mid)] hover:opacity-95",
              )}
            >
              Start Your Session Now
            </Link>
          </HmGradientBorder>
        </div>
      </section>
    </div>
  );
}
